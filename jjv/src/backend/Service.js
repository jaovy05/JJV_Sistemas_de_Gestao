const express = require('express');
const app = express();
const port = 5000;
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./Database.js');
const bcrypt = require("bcrypt");
const pessoas = require('./Pessoas.js');
const operacao = require('./Operacao.js');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: '4provas_na_semana_é_pra_matar_qualquer_um_pqp',
};

const auth = passport.authenticate('jwt', { session: false });

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await db.one(
      "SELECT p.cod, p.email, p.inativo, f.senha, p.nome FROM pessoa as p "+
      "JOIN funcionario as f on f.codp = p.cod "+
      "WHERE cod = $1", 
      [jwt_payload.sub]);

      if (user && user.inativo !== 1) {
        
        user.isAdm = jwt_payload.adm === 1;
        return done(null, user);
      } else {
        return done(null, false);
      } 
    
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) {
      console.log("Erro ao remover funcionario. Não existe o cod informado");
      return done(null, false);
    } else {
      console.log(error);
      return done(null, false);
    }
  }
 
}));
 
app.use(express.json());
app.use(passport.initialize());

app.use(cors({
  origin: 'http://localhost:3000', // Permite requisições deste domínio
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'X-Requested-With,','Accept','Origin','Authorization'] // Cabeçalhos permitidos
}));

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.one(
      "SELECT f.senha, f.adm, p.cod, p.email, p.inativo, p.nome FROM pessoa as p " +
      "join funcionario as f on p.cod = f.codp WHERE email = $1", 
      [email]
    );

     const passwordMatch = await bcrypt.compare(
       password,
       user.senha,
     );

    if (user && passwordMatch && (user.inativo !== 1)){
      const payload = { sub: user.cod, adm: user.adm };
      const token = jwt.sign(payload, opts.secretOrKey,
         {expiresIn: "10h"}
        );
      res.json({ message: 'Authenticated', token, cod: user.cod, isAdm: user.adm === 1});
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/adm', async(req, res) => {
  const saltRounds = 9;
  try {
    const func = req.body;

    const pessoa = await db.one(
      "INSERT INTO pessoa (nome, email, data, endn, end_logra, telefone1, telefone2) "+
      "VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING cod;",
      [func.nome, func.email, func.data, func.endn, func.end_logra, func.telefone1, func.telefone2]
    ); 
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync(func.senha, salt);
    await db.none(
      "INSERT INTO funcionario (cpf, senha, pis, codp, adm) "+
      "VALUES ($1, $2, $3, $4, $5);",
      [func.cpf, password, func.pis, pessoa.cod, 1]
    );
    res.status(201).json({menssage: "Administrador " + func.nome + " registrado com sucesso." });
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao cadastrar administrador: " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

app.get('/check/user', auth, (req, res) => {
  if (req.user) {
    res.status(200).json({ isAdm: req.user.isAdm, userName: req.user.nome });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});
// Rotas protegidas

/*  PESSOAS */

/* FUNCIONÁRIO */

app.get('/funcionario', auth, pessoas.getFunc);

app.post('/funcionario', auth, pessoas.postFunc);

app.put('/funcionario/:id', auth, pessoas.putFunc);

/* CLIENTE */

app.get('/cliente', auth, pessoas.getCli);

app.post('/cliente', auth, pessoas.postCli);

app.put('/cliente/:id', auth, pessoas.putCli);

/* TERCEIRIZADO */

app.get('/terceirizado', auth, pessoas.getTer);

app.post('/terceirizado', auth, pessoas.postTer);

app.put('/terceirizado/:id', auth, pessoas.putTer);

/* OPERAÇÃO */

app.get('/operacao', auth, operacao.getOp);

app.post('/operacao', auth, operacao.postOp);

app.put('/operacao/:cod', auth, operacao.putOp);

app.delete('/operacao/:cod', auth, operacao.deleteOp);

/* SERVICO */

app.get('/servico/t', auth, async(req, res) => {
  try {
    const servicoTer = await db.any(
      "select * from servico as s "+
      "join serv_ter as st on st.oss = s.os "+
      "join terceirizado as t on t.cnpj = st.cnpjt;"
    );

    res.json(servicoTer);
  } catch (error) {
    res.status(500).json({error});
  }
});

app.post('/servico', auth, async(req, res) => {
  try {
    const servico = req.body;
    await db.one(
      "insert into servico (os, data_ter, data_esperada) "+
      "values ($1, $2, $3) "+
      "returning os;",
      [servico.os, servico.data_ter, servico.data_esperada]
    );

    await db.one(
      "insert into encaminha (qtd_env, os_serv, tam_ct, codp) "+
      "values ($1, $2, $3, $4) returning tam_ct, codp; ",
      [servico.corte.qtd, servico.os, servico.corte.tam, servico.corte.codp]
    );

    await db.one(
      "insert into serv_ter (cnpj, oss) "+
      "values ($1, $2) returning cnpj;",
      [servico.terceiro.cnpj, servico.os]
    );

    servico.ops.map(async (op) => {
      await db.one(
        "insert into serv_op (codop, oss) "+
        "values ($1, $2) returning codop;",
        [op.cod, servico.os]
      );
    });
  } catch (error) {
    res.status(500).json({error});
  }
  
});

app.put('/servico/:os', auth, async(req, res) => {
  try {
    const os = parseInt(req.params);
    const servico = req.body;
    await db.one(
      "update servico set data_ter = $1, data_esperada = $2, data_ent = $3) "+
      "where os = $4"+
      "returning os;",
      [ servico.data_ter, servico.data_esperaa, servico.data_en, os]
    );

    await db.one(
      "update encaminha set qtd_env = $1, tam_ct = $2, codp = $3) "+
      "where os_serv = $4 returning tam_ct, codp; ",
      [servico.corte.qtd, servico.corte.tam, servico.corte.codp, os]
    );

    await db.one(
      "update serv_ter set cnpj = $1 "+
      "where os = $2 returning cnpj;",
      [servico.terceiro.cnpj, os]
    );

    servico.ops.map(async (op) => {
      await db.one(
        "update serv_op set codop = $1 "+
        "where oss = $2 returning codop;",
        [op, os]
      );
    });
  } catch (error) {
    res.status(500).json({error});
  }
  
});

app.delete('/servico/:os', auth, async(req, res) => {
  try {
    const os = parseInt(req.params);
    await db.one(
      "delete from servico "+
      "where os = $1  "+
      "returning os;",
      [os]
    );

    await db.one(
      "delete from encaminha "+
      "where os_serv = $1 returning tam_ct, codp; ",
      [os]
    );

    await db.one(
      "delete from serv_ter "+
      "where oss = $1  returning cnpj;",
      [os]
    );
    
    await db.one(
      "delete from serv_op "+
      "where oss = $1 returning codop;",
      [os]
    );
   
  } catch (error) {
    res.status(500).json({error});
  }
});


/* PEDIDO */

app.get('/pedido', auth, async (req, res) => {
  try {
    const pessoas = await db.many(
      "SELECT * FROM pedido ORDER BY cod DESC"
    );
    res.json(pessoas);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao buscar pedido(s): " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

app.post('/pedido', auth, async(req, res) => {
  try {
    const pedido = req.body;
    const novoPedido = await db.one(
      "INSERT INTO pedido (cod, pedido, op, comp, qtdp, qtdm, qtdg, qtdgg, qtdxgg, avm,obs, cnpjc,codf,codt) "+
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING cod;",
      [pedido.cod, pedido.pedido, pedido.op, pedido.comp, pedido.qtdp, pedido.qtdm, pedido.qtdg, pedido.qtdgg, pedido.qtdxgg, pedido.avm, pedido.obs, pedido.cnpjc, pedido.codf, pedido.codt]
    ); 
    res.status(201).json(novoPedido);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao cadastrar terceirizado: " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

app.put('/pedido/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const pedido = req.body;

    const editPedido = await db.one(
      "UPDATE pedido SET cod = $1, pedido = $2, op = $3, comp = $4, qtdp = $5, qtdm = $6, qtdg = $7, qtdgg = $8, qtdxgg = $9, avm = $10, obs = $11, cnpjc = $12, codf = $13, codt = $14 " +
      "WHERE cod = $15 RETURNING *;",
      [pedido.cod, pedido.pedido, pedido.op, pedido.comp, pedido.qtdp, pedido.qtdm, pedido.qtdg, pedido.qtdgg, pedido.qtdxgg, pedido.avm, pedido.obs, pedido.cnpjc, pedido.codf, pedido.codt, id]
    );
    
    res.status(201).json(editPedido);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) {
      res.status(400).json({ error: "Erro ao cadastrar Pedido " + error.message });
    } else {
      res.status(500).json({ error: "Aquiiiiiiiii " + error.message });
    }
  }
});

/* GASTOS */

app.get('/grafico', auth, async (req, res) => {
  try {
    const ano = new Date().getFullYear() - 1;
    const mes = new Date().getMonth() + 1;
    const gastoMensal = await db.any(
      "select extract(month from s.data_ent) as mes, sum(o.valor * e.qtd_env) from servico s "+
      "join serv_op as so on so.oss = s.os "+
      "join operacao as o on so.codop = o.cod "+
      "join encaminha as e on s.os = e.os_serv "+
      "where s.data_ent >= $1 "+
      "group by mes, extract(year from s.data_ent) "+
      "order by extract(year from s.data_ent), mes;",
      [`${ano}-${mes}-01`]
    );
    res.status(200).json(gastoMensal);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) {
      res.status(400).json({ error: "Erro ao buscar grafico " + error.message });
    } else {
      res.status(500).json({ error: "erro no servidor " + error.message });
    }
  }
});
/* CORTE DE PEÇAS */

app.get('/corte', auth, async (req, res) => {
  try {
    const cortes = await db.any("SELECT * FROM corte ORDER BY codp DESC");
    res.json(cortes);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao buscar corte(s): " + error.message });
    else res.status(500).json({ error: error.message });
  }
});


app.post('/corte', auth, async(req, res) => {
  try {
    const { tam, qtd, codp } = req.body;
    const novoCorte = await db.one(
      "INSERT INTO corte (tam, qtd, codp) VALUES ($1, $2, $3) RETURNING codp;",
      [tam, qtd, codp]
    ); 
    res.status(201).json(novoCorte);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao cadastrar corte: " + error.message });
    else res.status(500).json({ error: error.message });
  }
});


app.put('/corte/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { tam, qtd, codp } = req.body;

    const editCorte = await db.one(
      "UPDATE corte SET tam = $1, qtd = $2, codp = $3 WHERE codp = $4 RETURNING *;",
      [tam, qtd, codp, id]
    );
    
    res.status(201).json(editCorte);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) {
      res.status(400).json({ error: "Erro ao editar corte: " + error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});


/* MODELO */

app.get('/modelo', auth, async (req, res) => {
  try {
    const modelos = await db.many(
      "SELECT * FROM modelo ORDER BY cod DESC"
    );
    res.json(modelos);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao buscar modelo(s): " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

app.post('/modelo', auth, async(req, res) => {
  try {
    const modelo = req.body;

    const novoModelo = await db.one(
      "INSERT INTO modelo (cod, dsc, cnpjc) "+
      "VALUES ($1, $2, $3) RETURNING cod;",
      [modelo.cod, modelo.dsc, modelo.cnpjc]
    ); 
    res.status(201).json(novoModelo);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao cadastrar modelo: " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

app.put('/modelo/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const modelo = req.body;

    const editModelo = await db.one(
      "UPDATE modelo SET cod = $1, dsc = $2, cnpjc = $3" +
      "WHERE cod = $4 RETURNING *;",
      [modelo.cod, modelo.dsc, modelo.cnpjc, id]
    );
    
    res.status(201).json(editModelo);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) {
      res.status(400).json({ error: "Erro ao editar modelo de peças " + error.message });
    } else {
      res.status(500).json({ error: "Aquiiiiiiiii " + error.message });
    }
  }
});

/* RELATÓRIO */
app.post('/relatorio', async (req, res) => {
  const { terceirizado, cliente, dataInicio, dataFim } = req.body;

  let query = 
    "SELECT t.cnpj as terceirizado, s.data_ter as dataRetirada, s.data_ent as dataEntrega, o.valor "+
    "FROM terceirizado t "+
    "JOIN serv_ter st ON t.cnpj = st.cnpjt "+
    "JOIN servico s ON st.oss = s.os "+
    "JOIN serv_op so ON s.os = so.oss "+
    "JOIN operacao o ON so.codop = o.cod "+
    "JOIN encaminha e on e.os_serv = s.os "+
    "JOIN corte c on c.tam = e.tam, c.codp = e.tam_ct "+
    "JOIN pedido p on p.op = c.codp "+
    "JOIN cliente cli on cli.cnpj = p.cnpjc"
    "WHERE 1=1 "
  ;

  if (terceirizado) {
    query += ` AND t.cnpj = ${terceirizado} `;
  }
  if (cliente) {
    query += ` AND c.cnpj = ${cliente}`;
  }
  if (dataInicio) {
    query += ` AND s.data_ter >= ${dataInicio}`;
  }
  if (dataFim) {
    query += ` AND s.data_ent <= ${dataFim}`;
  }

  try {
    /* const result = await db.any(query);
    res.json(result); */
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

//Table Home
app.get('/tablehome', auth, async (req, res) => {
  try {
    const home = await db.many(
      "SELECT t.*, p.nome, ped.pedido, m.dsc FROM terceirizado t join pessoa p on p.cod = t.codp join cliente c on c.codp = p.cod join pedido ped on ped.cnpjc = c.cnpj join modelo m on m.cnpjc = c.cnpj ORDER BY codp ASC"
    );
    res.json(home);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao buscar pedido(s): " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

/* PORT */

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});
