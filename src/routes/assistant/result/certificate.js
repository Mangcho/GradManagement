const express = require('express');
const mysql = require('mysql2');

const router = express.Router();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONN_LIMIT,
    dateStrings: true, // return DATE type 
    multipleStatements: true 
});

const GetCertificate = (req, res) => {
    return res.render(__dirname + '/../../../views/assistant/result/certificate.ejs');
}


router.get('/', GetCertificate);


module.exports = router;