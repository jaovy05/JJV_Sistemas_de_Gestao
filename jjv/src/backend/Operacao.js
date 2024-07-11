const db = require('./Database.js');

async function getOp(req, res)  {
    try {
      const operacoes = await db.any(
        "select cod, valor, dsc from operacao "+
        "order by cod desc;",
      );
      res.json(operacoes); 
    } catch (error) {
      res.status(500).send(error);
    }
  };

async function postOp(req, res) {
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
  }

  async function putOp(req, res) {
    try {
      const cod = parseInt(req.params.cod);
      const operacao = req.body;
      const newOp = await db.one(
        "update operacao set valor = $1, dsc = $2 "+
        "where cod = $3 returning valor, dsc;",
        [operacao.valor, operacao.dsc, cod]
      );
      res.status(201).json(newOp);
    } catch (error) {
      res.status(500).json({error});
    }
  }

  async function deleteOp(req, res) {
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
  }

module.exports = {getOp, postOp, putOp, deleteOp};