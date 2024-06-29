const express = require('express');
const app = express();
const port = 5000;
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const cors = require('cors');
const database = require('./Database');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret',
  issuer: 'accounts.examplesoft.com',
  audience: 'yoursite.net'
};

passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
  database.getPessoaById(jwt_payload.sub).then(user => {
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  }).catch(err => done(err, false));
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
    const { name, password } = req.body;
    const user = await database.getPessoaByName(name);
    if (user && user.senha === password) {
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

// Rotas protegidas
app.get('/cadastrar/pessoas', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const pessoas = await database.getPessoa();
    res.json(pessoas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/cadastrar/pessoas', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const pessoa = req.body;
    const novaPessoa = await database.createPessoa(pessoa);
    res.status(201).json(novaPessoa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/cadastrar/pessoas/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const id = req.params.id;
    const pessoa = req.body;
    const updatedPessoa = await database.updatePessoa(id, pessoa);
    res.json(updatedPessoa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/cadastrar/pessoas/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const id = req.params.id;
    await database.deletePessoa(id);
    res.json({ message: 'Pessoa removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});
