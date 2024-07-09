const { USER, HOST, DATABASE, PASSWORD, PORT } = require("./Auth/Auth");
const express = require('express');
const app = express();
const port = 5000;
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const cors = require('cors');
const pgp = require("pg-promise")({});
const db = pgp(`postgres://${USER}:${PASSWORD}@${HOST}:${PORT}/${DATABASE}`);
const bcrypt = require("bcrypt");

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

    if (user && (user.email === email) && passwordMatch && (user.inativo != 1)){
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

app.post('/logout', (req, res) => {
  try {
    res.status(200).send('Logout realizado com sucesso.');
  } catch (error) {
    console.error('Erro durante o logout:', error);
    res.status(500).send('Erro interno durante o logout.');
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
// Rotas protegidas

app.get('/check/user', auth, (req, res) => {
  if (req.user) {
    res.json({ isAdm: req.user.isAdm, userName: req.user.nome });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.get('/cadastrar/pessoas/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const pessoa = await db.oneOrNone("SELECT * FROM pessoa WHERE cod = $1", [id]);
    
    if (pessoa) {
      res.json(pessoa);
    } else {
      res.status(404).json({ message: 'Pessoa não encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.get('/cadastrar/pessoas', auth, async (req, res) => {
  try {
    const pessoas = await db.many(
      "SELECT * FROM pessoa ORDER BY cod DESC"
    );
    res.json(pessoas);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao buscar pessoa(s): " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

app.post('/cadastrar/pessoas', auth, async (req, res) => {
  try {
    const pessoa = req.body;
    const novaPessoa = await db.one(
      "INSERT INTO pessoa (nome, email, data, endn, end_logra, telefone1, telefone2) "+
      "VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [pessoa.nome, pessoa.email, pessoa.data, pessoa.endn, pessoa.end_logra, pessoa.telefone1, pessoa.telefone2]);

    res.status(200).json(novaPessoa);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao cadastrar pessoa: " + error.message });
    else  res.status(500).json({ error: "Erro ao cadas " + error.message});
  }
});

app.put('/cadastrar/pessoas/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const pessoa = req.body;
    const updatedPessoa = await db.one(
      "UPDATE pessoa SET nome = $1, email = $2, data = $3, endn = $4, end_logra = $5, telefone1 = $6, telefone2 = $7 "+
      "WHERE cod = $8 RETURNING *",
      [pessoa.nome, pessoa.email, pessoa.data, pessoa.endn, pessoa.end_logra, pessoa.telefone1, pessoa.telefone2, id]
    );
    res.json(updatedPessoa);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.sendStatus(304);
    else if (error.code === 23502)
      res.sendStatus(400).json({error: "Preencha a coluna: " + error.column });
    else if (error.code === 22007)
      res.sendStatus(400).json({error: "Preencha a data corretamente dd/mm/aaaa"});
    else if (error.code === 22001)
      res.sendStatus(400).json({error: "Tamanho da string violada"});
    else  
      res.status(500).json({error});
  }
});

app.delete('/cadastrar/pessoas/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    await db.one(
      "delete from pessoa where cod = $1 returning nome",
      [id]
    );
    res.json({ message: 'Pessoa removida com sucesso' });
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao remover funcionario. Não existe o cod informado"});
    else  res.status(500).json({ error: error});
  }
});

app.get('/funcionario', auth, async (req, res) => {
  try {
    const funcionario = await db.many(
      "SELECT f.*, p.* FROM funcionario f join pessoa p on p.cod = f.codp  ORDER BY codp DESC"
    );
    res.json(funcionario);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao buscar funcionário(s): " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

app.post('/funcionario', auth, async(req, res) => {
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
      "INSERT INTO funcionario (cpf, senha, pis, codp) "+
      "VALUES ($1, $2, $3, $4);",
      [func.cpf, password, func.pis, pessoa.cod]
    );
    res.status(201).json({menssage: "Funcionário " + func.nome + " registrado com sucesso." });
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao cadastrar funcionario: " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

app.put('/funcionario/:id', auth, async(req, res) => {
  const saltRounds = 9;
  try {
    const id = req.params.id;
    const func = req.body;

    const funcionario = await db.one(
      "UPDATE pessoa SET nome = $1, email = $2, data = $3, endn = $4, end_logra = $5, telefone1= $6, telefone2 = $7"+
      "WHERE cod = $8 RETURNING cod;",
      [func.nome, func.email, func.data, func.endn, func.end_logra, func.telefone1, func.telefone2, id]
    ); 
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync(func.senha, salt);
    await db.none(
      "UPDATE funcionario SET cpf = $1, senha = $2, pis = $3 WHERE codp = $4;",
      [func.cpf, password, func.pis, funcionario.cod]
    );
    res.status(201).json({menssage: "Funcionário " + func.nome + " registrado com sucesso." });
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao cadastrar funcionario: " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

app.get('/operacao', auth, async(req, res) => {
  try {
    const operacoes = await db.any(
      "select cod, valor, dsc from operacao;",
    );
    res.json(operacoes); 
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/operacao', auth, async(req, res) => {
  try {
    const operacao = req.body;
    await db.none(
      "insert into operacao (valor, dsc) "+
      "values ($1, $2);",
      [operacao.valor, operacao.dsc]
    );
    res.status(201).json(operacao);
  } catch (error) {
    res.status(500).json({error});
  }
});

app.put('/operacao/:cod', auth, async(req, res) => {
  try {
    const cod = parseInt(req.params.cod);
    const operacao = req.body;
    const newOp = await db.one(
      "update operacao set valor = $1, dsc = $2 "+
      "where cod = $3 returning valor, dsc;",
      [operacao.valor, operacao.dsc, cod]
    );
    res.status(200).json(newOp);
  } catch (error) {
    res.status(500).json({error});
  }
});

app.delete('/operacao/:cod', auth, async(req, res) => {
  try {
    const cod = parseInt(req.params.cod);
    console.log(cod);
    const operacao = await db.one(
      "delete from operacao where cod = $1 " +
      "returning dsc;",
      [cod]
    );
    res.status(200).json(operacao);
  } catch (error) {
    res.status(500).json({error});
  }
});

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

app.get('/terceirizado', auth, async (req, res) => {
  try {
    const funcionario = await db.many(
      "SELECT t.*, p.* FROM terceirizado t join pessoa p on p.cod = t.codp  ORDER BY codp DESC"
    );
    res.json(funcionario);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao buscar tercerizado(s): " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

app.post('/terceirizado', auth, async(req, res) => {
  try {
    const terc = req.body;

    const pessoa = await db.one(
      "INSERT INTO pessoa (nome, email, data, endn, end_logra, telefone1, telefone2) "+
      "VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING cod;",
      [terc.nome, terc.email, terc.data, terc.endn, terc.end_logra, terc.telefone1, terc.telefone2]
    ); 
    await db.none(
      "INSERT INTO terceirizado (cnpj,codp) "+
      "VALUES ($1, $2);",
      [terc.cnpj, pessoa.cod]
    );
    res.status(201).json({menssage: "Terceirizado " + terc.nome + " registrado com sucesso." });
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao cadastrar terceirizado: " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

app.put('/terceirizado/:id', auth, async(req, res) => {
  try {
    const id = req.params.id;
    const terc = req.body;

    const terceirizado = await db.one(
      "UPDATE pessoa SET nome = $1, email = $2, data = $3, endn = $4, end_logra = $5, telefone1= $6, telefone2 = $7 "+
      "WHERE cod = $8 RETURNING cod;",
      [terc.nome, terc.email, terc.data, terc.endn, terc.end_logra, terc.telefone1, terc.telefone2, id]
    ); 
    await db.none(
      "UPDATE terceirizado SET cnpj = $1 WHERE codp = $2;",
      [terc.cnpj,terceirizado.cod]
    );
    res.status(201).json({menssage: "Terceirizado " + terc.nome + " registrado com sucesso." });
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao cadastrar terceirizado " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});


app.get('/cliente', auth, async (req, res) => {
  try {
    const funcionario = await db.many(
      "SELECT c.*, p.* FROM cliente c join pessoa p on p.cod = c.codp  ORDER BY codp DESC"
    );
    res.json(funcionario);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao buscar cliente(s): " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

app.post('/cliente', auth, async(req, res) => {
  try {
    const cli = req.body;

    const pessoa = await db.one(
      "INSERT INTO pessoa (nome, email, data, endn, end_logra, telefone1, telefone2) "+
      "VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING cod;",
      [cli.nome, cli.email, cli.data, cli.endn, cli.end_logra, cli.telefone1, cli.telefone2]
    ); 
    await db.none(
      "INSERT INTO cliente (cnpj,codp) "+
      "VALUES ($1, $2);",
      [cli.cnpj, pessoa.cod]
    );
    res.status(201).json({menssage: "Terceirizado " + cli.nome + " registrado com sucesso." });
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao cadastrar cliente: " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

app.put('/cliente/:id', auth, async(req, res) => {
  try {
    const id = req.params.id;
    const cli = req.body;

    const cliente = await db.one(
      "UPDATE pessoa SET nome = $1, email = $2, data = $3, endn = $4, end_logra = $5, telefone1= $6, telefone2 = $7"+
      "WHERE cod = $8 RETURNING cod;",
      [cli.nome, cli.email, cli.data, cli.endn, cli.end_logra, cli.telefone1, cli.telefone2, id]
    ); 
    await db.none(
      "UPDATE cliente SET cnpj = $1 WHERE codp = $2;",
      [cli.cnpj,cliente.cod]
    );
    res.status(201).json({menssage: "Cliente " + cli.nome + " registrado com sucesso." });
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao cadastrar cliente " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

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
      "group by extract(month from s.data_ent);",
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

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});
