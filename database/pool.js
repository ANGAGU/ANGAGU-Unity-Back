import { createPool } from 'mysql2';
import config from '../config.js';

const pool = createPool(config.dbConfig).promise();

export {
  pool,
};