// require("dotenv").config();

const { Pool } = require("pg");

// const connectionString = 'postgres://postgres:postgres@localhost:5432/api';
const connectionString = 'postgres://wzkowhhekyvcbh:dbc37ca58c23fa2edf7ed4af8319e00316de9aaf1defbb8cac1fd86500704f6a@ec2-107-20-173-2.compute-1.amazonaws.com:5432/d2346t6en0926l';


const pool = new Pool({
    connectionString: connectionString,
});

module.exports = { pool };