const db = require('./database.js');

async function getPed(req, res) {
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
  };

  async function postPed(req, res) {
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
  };

  async function putPed(req, res) {
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
  }

  async function home(req, res) {
    try {
      const home = await db.any(
        "SELECT p.nome, ped.pedido, m.dsc FROM cliente c "+
        "join modelo m on m.cnpjc = c.cnpj " +
        "join pedido ped on ped.cnpjc = c.cnpj "+
        "join corte co on co.codp = ped.op "+
        "join encaminha e on e.tam_ct = co.tam and e.codp = co.codp "+
        "join servico s on s.os = e.os_serv "+
        "join serv_ter st on st.oss = s.os "+
        "join terceirizado t on t.cnpj = st.cnpjt "+
        "join pessoa p on p.cod = t.codp "+
        " ORDER BY t.codp ASC;"
      );
      res.json(home);
    } catch (error) {
      if (error instanceof db.$config.pgp.errors.QueryResultError) 
        res.status(400).json({ error: "Erro ao buscar pedido(s): " + error.message });
      else  res.status(500).json({ error: error.message});
    }
  };

module.exports = {getPed, postPed, putPed, home};