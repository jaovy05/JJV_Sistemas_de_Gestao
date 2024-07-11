const db = require('./database.js');

async function getSv(req, res){
    try {
      const servicoTer = await db.any(
        "select s.os, p.nome as ter, e.codp, e.tam_ct as tam, qtd_env as qtd, "+
        "data_ent as datee, data_ent as datet, o.cod as op "+
        "from servico as s "+
        "join serv_ter as st on st.oss = s.os "+
        "join terceirizado as t on t.cnpj = st.cnpjt " +
        "join pessoa p on p.cod = t.codp "+
        "join encaminha e on e.os_serv = s.os "+
        "join serv_op sv on sv.oss = s.os "+
        "join operacao o on o.cod = sv.codop"
      );
  
      res.json(servicoTer);
    } catch (error) {
      res.status(500).json({error});
    }
  };

  async function postSv(req, res) {
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
    }};

    async function putSv(req, res) {
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
      };

      async function deleteSv(req, res) {
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
      };

module.exports = {getSv, postSv, putSv, deleteSv};