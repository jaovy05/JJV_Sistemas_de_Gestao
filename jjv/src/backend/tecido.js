const db = require('./database.js');

async function get(req, res) {
    try {
        const tecidos = await db.any(
            "select dsc, nome, cod from tecido;"
        );
        res.status(200).json(tecidos);
    } catch (error) {
        if (error instanceof db.$config.pgp.errors.QueryResultError) {
            res.status(400).json({ error: "Erro no sql buscar tecido " + error.message });
          } else {
            res.status(500).json({ error: "erro no servidor " + error.message });
          }
    }
};

async function put(req, res){
    try {
        const cod = req.params.cod;
        const tecido = req.body;
        await db.one(
            "update tecido set dsc = $1, nome = $2 "+
            "where cod = $3 returning cod;",
            [tecido.dsc, tecido.nome, cod]
        );
    } catch (error) {
        if (error instanceof db.$config.pgp.errors.QueryResultError) {
            res.status(400).json({ error: "Erro no sql atualizar tecido " + error.message });
          } else {
            res.status(500).json({ error: "erro no servidor " + error.message });
          }
    }
}

async function post(req, res){
    try {
        const tecido = req.body;
        await db.one(
            "insert into tecido (dsc, cod, nome) "+
                "values ($1, $2, $3)",
            [tecido.dsc, tecido.cod, tecido.nome]
        );
    } catch (error) {
        if (error instanceof db.$config.pgp.errors.QueryResultError) {
            res.status(400).json({ error: "Erro no sql criar tecido " + error.message });
          } else {
            res.status(500).json({ error: "erro no servidor " + error.message });
          }
    }
}

module.exports = {get, put, post}