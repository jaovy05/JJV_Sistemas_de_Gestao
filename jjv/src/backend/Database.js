const { USER, HOST, DATABASE, PASSWORD, PORT } = require("./Auth/Auth");
const { Pool } = require("pg");
const pool = new Pool({
  user: USER,
  host: HOST,
  database: DATABASE,
  password: PASSWORD,
  port: PORT,
});

const getPessoa = async () => {
  try {
    const result = await pool.query("SELECT * FROM pessoa");
    if (result && result.rows) {
      return result.rows;
    } else {
      throw new Error("Não foi possível encontrar resultados");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Erro interno do servidor");
  }
};

const createPessoa = async (pessoa) => {
  try {
    const result = await pool.query(
      "INSERT INTO pessoa (nome, email, date, endn, end_logra, telefone1) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [pessoa.nome, pessoa.email, pessoa.date, pessoa.endn, pessoa.end_logra, pessoa.telefone1]
    );
    if (result && result.rows && result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new Error("Não foi possível criar pessoa");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Erro interno do servidor");
  }
};

const getPessoaByName = async (name) => {
  try {
    const result = await pool.query("SELECT f.senha,* FROM pessoa p join funcionario f on p.cod = f.codp WHERE nome = $1", [name]);
    if (result && result.rows && result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new Error("Usuário não encontrado");
    }
  } catch (error) {
    console.error("Erro ao buscar usuário", error);
    throw new Error("Erro interno do servidor");
  }
};

const getPessoaById = async (id) => {
  try {
    const result = await pool.query("SELECT * FROM pessoa WHERE cod = $1", [id]);
    if (result && result.rows && result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new Error("Usuário não encontrado");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Erro interno do servidor");
  }
};

module.exports = {
  getPessoa,
  createPessoa,
  getPessoaByName,
  getPessoaById,
};
