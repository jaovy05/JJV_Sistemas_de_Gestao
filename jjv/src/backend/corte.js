const db = require('./database.js');

async function get(req, res) {
    try {
      const cortes = await db.any("SELECT * FROM corte ORDER BY codp DESC");
      res.json(cortes);
    } catch (error) {
      if (error instanceof db.$config.pgp.errors.QueryResultError) 
        res.status(400).json({ error: "Erro ao buscar corte(s): " + error.message });
      else res.status(500).json({ error: error.message });
    }
  };

  async function post(req, res) {
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
  };

  async function put(req, res) {
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
  };

module.exports = {get, post, put}