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
  issuer: 'accounts.examplesoft.com',
  audience: 'yoursite.net'
};

auth = passport.authenticate('jwt', { session: false });

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await db.one(
      "SELECT * FROM pessoa WHERE cod = $1", 
      [jwt_payload.sub]);

      if (user) {
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

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//   next();
// });

app.use(cors({
  origin: 'http://localhost:3000', // Permite requisições deste domínio
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'X-Requested-With,','Accept','Origin','Authorization'] // Cabeçalhos permitidos
}));

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.one(
      "SELECT f.senha, p.* FROM pessoa as p " +
      "join funcionario as f on p.cod = f.codp WHERE email = $1", 
      [email]
    );

    const passwordMatch = await bcrypt.compare(
      password,
      user.senha,
    );

    if (user && passwordMatch) {
      const payload = { sub: user.cod };
      const token = jwt.sign(payload, opts.secretOrKey, {
        issuer: opts.issuer,
        audience: opts.audience
      });
      res.json({ message: 'Authenticated', token });
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
      [func.nome, func.email, func.date, func.endn, func.end_logra, func.telefone1, func.telefone2]
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
      [pessoa.nome, pessoa.email, pessoa.date, pessoa.endn, pessoa.end_logra, pessoa.telefone1, pessoa.telefone2]);

    res.status(201).json(novaPessoa);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao cadastrar pessoa: " + error.message });
    else  res.status(500).json({ error: error.message});
  }
});

app.put('/cadastrar/pessoas/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const pessoa = req.body;
    const updatedPessoa = await db.one(
      "UPDATE pessoa SET nome = $1, email = $2, data = $3, endn = $4, end_logra = $5, telefone1 = $6, telefone2 = $7 "+
      "WHERE cod = $8 RETURNING *",
      [pessoa.nome, pessoa.email, pessoa.date, pessoa.endn, pessoa.end_logra, pessoa.telefone1, pessoa.telefone2, id]
    );
    res.json(updatedPessoa);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.sendStatus(304);
    else if (error.code == 23502)
      res.sendStatus(400).json({error: "Preencha a coluna: " + error.column });
    else if (error.code == 22007)
      res.sendStatus(400).json({error: "Preencha a data corretamente dd/mm/aaaa"});
    else if (error.code == 22001)
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

app.post('/funcionario', auth, async(req, res) => {
  const saltRounds = 9;
  try {
    const func = req.body;

    const pessoa = await db.one(
      "INSERT INTO pessoa (nome, email, data, endn, end_logra, telefone1, telefone2) "+
      "VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING cod;",
      [func.nome, func.email, func.date, func.endn, func.end_logra, func.telefone1, func.telefone2]
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

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});
