const db = require('./database.js');

async function get(req, res) {
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
  };

  async function post(req, res)  {
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
  };

  async function put(req, res) {
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
  };

module.exports = {get, post, put};