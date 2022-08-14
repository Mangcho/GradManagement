const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const fs = require('fs');

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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/templates/policy')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname +'.pdf');
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype == 'application/pdf') {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
})

const upload = multer({
    storage: storage
});

const GetPolicy = (req, res) => {
    return res.render(__dirname + '/../../../views/assistant/policy/policy.ejs');
}

const PostPolicy = (req, res) => {
    if(req.file == undefined){
        return res.status(400).end();
    }

    if (req.file.mimetype == 'application/pdf') {
        return res.render(__dirname + '/../../../views/assistant/policy/policy.ejs');
    } else {
        return res.status(415).end();
    }

}

router.get('/', GetPolicy);
router.post('/', upload.single('graduationPolicy'), PostPolicy);


module.exports = router;