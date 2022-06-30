// require("dotenv").config();

const { Pool } = require("pg");

// const connectionString = 'postgres://postgres:postgres@localhost:5432/api';
const connectionString = 'postgres://gltbttzjsnhslx:0e5170a75dc8961515c3b5d2af7e874c7981d35cf580ae46eb1c38d97833d426@ec2-54-159-126-187.compute-1.amazonaws.com:5432/df11rr5nod4181';


const pool = new Pool({
    connectionString: connectionString,
});

module.exports = { pool };
