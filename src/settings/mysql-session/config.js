const db = require('../database/config.js');
require('dotenv').config();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    clearExpired: true,
    
  };

const sessionStore = new MySQLStore(options); // Cannot handle current mysql2 promise

module.exports = {
    sessionStore
}