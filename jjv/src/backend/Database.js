const { USER, HOST, DATABASE, PASSWORD, PORT } = require("./Auth/Auth.js");
const pgp = require("pg-promise")({});
const db = pgp(`postgres://${USER}:${PASSWORD}@${HOST}:${PORT}/${DATABASE}`);

module.exports = db;