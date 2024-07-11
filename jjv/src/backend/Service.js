const express = require('express');
const app = express();
const port = 5000;
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./database.js');
const bcrypt = require("bcrypt");

const pessoas = require('./pessoas.js');
const operacao = require('./operacao.js');
const servico = require('./servico.js');
const pedido = require('./pedido.js');
const corte = require('./corte.js');
const modelo = require('./modelo.js');
const relatorio = require('./relatorio.js');

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

// Rotas protegidas

app.get('/check/user', auth, (req, res) => {
  if (req.user) {
    res.status(200).json({ isAdm: req.user.isAdm, userName: req.user.nome });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

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

app.get('/servico/t', auth, servico.getSv);
app.post('/servico', auth, servico.postSv);
app.put('/servico/:os', auth, servico.putSv);
app.delete('/servico/:os', auth, servico.deleteSv);

/* PEDIDO */

app.get('/pedido', auth, pedido.getPed);
app.post('/pedido', auth, pedido.postPed);
app.put('/pedido/:id', auth, pedido.putPed);
app.get('/tablehome', auth, pedido.home);

/* CORTE DE PEÇAS */

app.get('/corte', auth, corte.get);
app.post('/corte', auth, corte.post);
app.put('/corte/:id', auth, corte.put);

/* MODELO */

app.get('/modelo', auth, modelo.get);
app.post('/modelo', auth, modelo.post);
app.put('/modelo/:id', auth, modelo.put);

/* RELATÓRIO */

app.get('/relatorio', auth, relatorio.relatorio);
app.get('/grafico', auth, relatorio.grafico);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});
