import mysql from 'mysql2';
const dbConfig = require('../config.json');

const pool = mysql.createPool(dbConfig).promise();

module.exports = { pool };