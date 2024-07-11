const db = require('./database.js');
const bcrypt = require("bcrypt");
/* FUNCIONÁRIO */

async function getFunc(req, res) {
    try {
        const funcionario = await db.many(
        "SELECT f.*, p.* FROM funcionario f join pessoa p on p.cod = f.codp "+
        "where p.inativo is null "+
        " ORDER BY codp DESC"
        );
        res.json(funcionario);
    } catch (error) {
         if (error instanceof db.$config.pgp.errors.QueryResultError) 
        res.status(400).json({ error: "Erro ao buscar funcionário(s): " + error.message });
        else  res.status(500).json({ error: error.message}); 
    }
};

async function postFunc(req, res) {
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
  }

async function putFunc(req, res) {
    const saltRounds = 9;
    try {
      const id = req.params.id;
      const func = req.body;
      const funcionario = await db.one(
        "UPDATE pessoa SET nome = $1, email = $2, data = $3, endn = $4, end_logra = $5, telefone1= $6, telefone2 = $7 "+
        "WHERE cod = $8 RETURNING cod;",
        [func.nome, func.email, func.data, func.endn, func.end_logra, func.telefone1, func.telefone2, id]
      ); 
      const salt = bcrypt.genSaltSync(saltRounds);
      const password = bcrypt.hashSync(func.senha, salt);
      await db.none(
        "UPDATE funcionario SET cpf = $1, senha = $2, pis = $3, adm = $4 WHERE codp = $5;",
        [func.cpf, password, func.pis, func.adm, funcionario.cod]
      );
      res.status(201).json({menssage: "Funcionário " + func.nome + " registrado com sucesso." });
    } catch (error) {
      if (error instanceof db.$config.pgp.errors.QueryResultError) 
        res.status(400).json({ error: "Erro ao cadastrar funcionario: " + error.message });
      else  res.status(500).json({ error: error.message});
    }
};  

/*  CLIENTE   */

async function getCli(req, res) {
    try {
      const cliente = await db.many(
        "SELECT c.*, p.* FROM cliente c join pessoa p on p.cod = c.codp "+
        "where p.inativo is null "+
        "ORDER BY codp DESC;"
      );
      res.json(cliente);
    } catch (error) {
      if (error instanceof db.$config.pgp.errors.QueryResultError) 
        res.status(400).json({ error: "Erro ao buscar cliente(s): " + error.message });
      else  res.status(500).json({ error: error.message});
    }
};

async function postCli(req, res)  {
    try {
      const cli = req.body;
  
      const pessoa = await db.one(
        "INSERT INTO pessoa (nome, email, data, endn, end_logra, telefone1, telefone2) "+
        "VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING cod;",
        [cli.nome, cli.email, cli.data, cli.endn, cli.end_logra, cli.telefone1, cli.telefone2]
      ); 
      await db.none(
        "INSERT INTO cliente (cnpj,codp) "+
        "VALUES ($1, $2);",
        [cli.cnpj, pessoa.cod]
      );
      res.status(201).json({menssage: "Terceirizado " + cli.nome + " registrado com sucesso." });
    } catch (error) {
      if (error instanceof db.$config.pgp.errors.QueryResultError) 
        res.status(400).json({ error: "Erro ao cadastrar cliente: " + error.message });
      else  res.status(500).json({ error: error.message});
    }
  }

async function putCli(req, res)  {
    try {
        const id = req.params.id;
        const cli = req.body;

        const cliente = await db.one(
            "UPDATE pessoa SET nome = $1, email = $2, data = $3, endn = $4, end_logra = $5, telefone1= $6, telefone2 = $7"+
            "WHERE cod = $8 RETURNING cod;",
            [cli.nome, cli.email, cli.data, cli.endn, cli.end_logra, cli.telefone1, cli.telefone2, id]
        ); 
        await db.none(
            "UPDATE cliente SET cnpj = $1 WHERE codp = $2;",
            [cli.cnpj,cliente.cod]
        );
        res.status(201).json({menssage: "Cliente " + cli.nome + " registrado com sucesso." });
    } catch (error) {
        if (error instanceof db.$config.pgp.errors.QueryResultError) 
        res.status(400).json({ error: "Erro ao cadastrar cliente " + error.message });
        else  res.status(500).json({ error: error.message});
    }
}

/* TERCEIRIZADO */

async function getTer(req, res) {
    try {
      const terceirizado = await db.many(
        "SELECT t.*, p.* FROM terceirizado t join pessoa p on p.cod = t.codp "+
        "where p.inativo is null "+
        "ORDER BY codp DESC;"
      );
      res.json(terceirizado);
    } catch (error) {
      if (error instanceof db.$config.pgp.errors.QueryResultError) 
        res.status(400).json({ error: "Erro ao buscar tercerizado(s): " + error.message });
      else  res.status(500).json({ error: error.message});
    }
  };

async function postTer(req, res)  {
  try {
    const terc = req.body;

    const pessoa = await db.one(
      "INSERT INTO pessoa (nome, email, data, endn, end_logra, telefone1, telefone2) "+
      "VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING cod;",
      [terc.nome, terc.email, terc.data, terc.endn, terc.end_logra, terc.telefone1, terc.telefone2]
    ); 
    await db.none(
      "INSERT INTO terceirizado (cnpj,codp) "+
      "VALUES ($1, $2);",
      [terc.cnpj, pessoa.cod]
    );
    res.status(201).json({menssage: "Terceirizado " + terc.nome + " registrado com sucesso." });
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao cadastrar terceirizado: " + error.message });
    else  res.status(500).json({ error: error.message});
  }
};

async function putTer(req, res) {
  try {
    const id = req.params.id;
    const terc = req.body;

    const terceirizado = await db.one(
      "UPDATE pessoa SET nome = $1, email = $2, data = $3, endn = $4, end_logra = $5, telefone1= $6, telefone2 = $7 "+
      "WHERE cod = $8 RETURNING cod;",
      [terc.nome, terc.email, terc.data, terc.endn, terc.end_logra, terc.telefone1, terc.telefone2, id]
    ); 
    await db.none(
      "UPDATE terceirizado SET cnpj = $1 WHERE codp = $2;",
      [terc.cnpj,terceirizado.cod]
    );
    res.status(201).json({menssage: "Terceirizado " + terc.nome + " registrado com sucesso." });
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao cadastrar terceirizado " + error.message });
    else  res.status(500).json({ error: error.message});
  }
}

  async function getAll(req, res){
    try {
      const all = await db.any(
        `select coalesce(f.cpf, t.cnpj, c.cnpj) as "cpfCnpj", p.nome, p.email, p.telefone1 as telefone from pessoa p `+
        "left join funcionario as f on f.codp = p.cod "+
        "left join terceirizado as t on t.codp = p.cod "+
        "left join cliente as c on c.codp = p.cod "+
        "where p.inativo is null "+
        "order by p.cod desc;"
      );
      res.status(200).json(all);
    } catch (error) {
      if (error instanceof db.$config.pgp.errors.QueryResultError) 
        res.status(400).json({ error: "Erro ao buscar pessoas " + error.message });
      else  res.status(500).json({ error: error.message});
    }
      
  };

async function deleta(req, res){
  try {
    const cpfCnpj = req.params.cpfCnpj;
    await db.any (
      "with ipessoa as "+
        "(select p.cod from pessoa p "+
          "left join funcionario as f on f.codp = p.cod "+
          "left join terceirizado as t on t.codp = p.cod "+
          "left join cliente as c on c.codp = p.cod "+
          "where coalesce(f.cpf, t.cnpj, c.cnpj) = $1) "+
      "update pessoa set inativo = 1 where cod = (select cod from ipessoa);",
      [cpfCnpj]   
    );
    res.sendStatus(200);
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) 
      res.status(400).json({ error: "Erro ao deletar pessoa " + error.message });
    else  res.status(500).json({ error: error.message});
  }
};

async function filtro(req, res){
  try {
    const {nome, cpfCnpj} = req.body;
    let query = `select coalesce(f.cpf, t.cnpj, c.cnpj) as "cpfCnpj", p.nome, p.email, p.telefone1 as telefone `+
      "from pessoa p "+
        "left join funcionario as f on f.codp = p.cod "+
        "left join terceirizado as t on t.codp = p.cod "+
        "left join cliente as c on c.codp = p.cod "+
        "where p.inativo is null ";
    if(nome) query += ` and p.nome ilike '%${nome}%'`;
    if(cpfCnpj) query += ` and "cpfCnpj" ilike '%${cpfCnpj}%'`

    const result = await db.any(query);
    res.status(200).json(result);      
  } catch (error) {
    if (error instanceof db.$config.pgp.errors.QueryResultError) {
      res.status(400).json({ error: "Erro ao buscar relatorio " + error.message });
    } else {
      res.status(500).json({ error: "erro no servidor " + error.message });
    }
  }
}
module.exports = {
    getFunc, postFunc, putFunc, 
    getCli, postCli, putCli,
    getTer, postTer, putTer,
    getAll, deleta, filtro
};