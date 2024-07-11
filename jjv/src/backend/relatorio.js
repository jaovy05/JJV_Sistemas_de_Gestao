const db = require('./database.js');

async function grafico(req, res) {
    try {
      const ano = new Date().getFullYear() - 1;
      const mes = new Date().getMonth() + 1;
      const gastoMensal = await db.any(
        "select extract(month from s.data_ent) as mes, sum(o.valor * e.qtd_env) from servico s "+
        "join serv_op as so on so.oss = s.os "+
        "join operacao as o on so.codop = o.cod "+
        "join encaminha as e on s.os = e.os_serv "+
        "where s.data_ent >= $1 "+
        "group by mes, extract(year from s.data_ent) "+
        "order by extract(year from s.data_ent), mes;",
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
  };

  async function relatorio(req, res) {
    const { terceirizado, cliente, dataInicio, dataFim } = req.body;
    let query = 
      "SELECT pt.nome as terceirizado, s.data_ter as data_inicio, s.data_ent as data_fim, o.valor * e.qtd_env as valor, pc.nome as cliente, "+
      "t.cnpj as cnpjt, cli.cnpj as cnpjc " +
      "FROM terceirizado t "+
        "JOIN serv_ter st ON t.cnpj = st.cnpjt "+
        "JOIN servico s ON st.oss = s.os "+
        "JOIN serv_op so ON s.os = so.oss "+
        "JOIN operacao o ON so.codop = o.cod "+
        "JOIN encaminha e on e.os_serv = s.os "+
        "JOIN corte c on c.tam = e.tam_ct AND c.codp = e.codp "+
        "JOIN pedido p on p.op = c.codp "+
        "JOIN cliente cli on cli.cnpj = p.cnpjc " +
        "JOIN pessoa pt on pt.cod = t.codp " +
        "JOIN pessoa pc on pc.cod = cli.codp "+
      "WHERE 1=1";
    
    if (terceirizado) {
      query += ` AND pt.nome ilike '%${terceirizado}%'`;
    }
    if (cliente) {
      query += ` AND pc.nome ilike '%${cliente}%'`;
    }

    if (dataInicio) {
      query += ` AND s.data_ter >= '${dataInicio}'`;
    }
    if (dataFim) {
      query += ` AND s.data_ent <= '${dataFim}'`;
    }
  
    try {
      const result = await db.any(query);
      res.json(result); 
    } catch (error) {
      if (error instanceof db.$config.pgp.errors.QueryResultError) {
        res.status(400).json({ error: "Erro ao buscar relatorio " + error.message });
      } else {
        res.status(500).json({ error: "erro no servidor " + error.message });
      }
    }
  };

module.exports = {grafico, relatorio};