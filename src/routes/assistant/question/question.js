const express = require('express');
const mysql = require('mysql2');
const crypto = require('node:crypto');

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

const GetHash = (data) => {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

const GetQuestion = (req, res) => {
    let page = req.body.page;
    let sql2;
    if (req.query.page === undefined) {
        page = Number(1);
    }
    else {
        page = parseInt(req.query.page);
        page = Math.max(1, page);
    }

    if (req.query.search === undefined) {
        sql2 = 'SELECT QUESTION.id, secret, title, student_id, STUDENT.name, STUDENT.state, timestamp FROM QUESTION ' +
            'LEFT JOIN STUDENT ON QUESTION.student_id = STUDENT.id ' +
            'LIMIT 20 OFFSET ' + Number((page - 1) * 20) + ';';
    }
    else {
        sql2 = 'SELECT QUESTION.id, secret, title, student_id, STUDENT.name, STUDENT.state, timestamp FROM QUESTION ' +
        'LEFT JOIN STUDENT ON QUESTION.student_id = STUDENT.id ' +
        'WHERE title LIKE "%' + req.query.search + '%" ' +
        'LIMIT 20 OFFSET ' + Number((page - 1) * 20) + ';';
    }

    const sql1 = 'SELECT id FROM QUESTION;';
    db.query(sql1 + sql2, function (error, results) {
        if (error) { // 애러 핸들링
            console.log("QUESTION DB query error! ", error);
            throw error;
        }
        const numOfQuestion = results[0].length;
        const maxPage = Math.ceil(numOfQuestion / 20);
        return res.render(__dirname + '/../../../views/assistant/question/question.ejs', { results: results[1], currentPage: page, maxPage: maxPage });
    })
}

const DeleteQuestion = (req, res) => {
    const data = req.body.data;
    if(data == undefined){
        res.send(400).end();
    }
    let sql = 'DELETE FROM QUESTION WHERE id = '
    const a = data.join(' OR id = ');
    sql = sql + a + ';';

    db.query(sql, function (error, results) {
        if (error) {
            console.log("NOTICE DB query error! : ", error);
            return res.send({ success: false });
        }
        return res.send({ success: true });
    })
}

const GetQuestionDetail = (req,res) => {
    const sql = 'SELECT QUESTION.id, secret, title, student_id, STUDENT.name, STUDENT.state, timestamp, content FROM QUESTION ' +
    'LEFT JOIN STUDENT ON QUESTION.student_id = STUDENT.id WHERE QUESTION.id="' + req.query.id + '";';
    db.query(sql, function (error, results) {
        if (error) {
            console.log("DB query error!");
            throw error;
        }
        return res.render(__dirname + '/../../../views/assistant/question/questionDetail.ejs', { result: results[0]});
    })
}

const GetQuestionForm = (req, res) => {
    return res.render(__dirname + '/../../../views/assistant/question/questionForm.ejs');
}

const PostQuestionForm = (req, res) => {
    console.log(req.session.id);
    const {title, secret, password, content, timestamp} = req.body;
    const id = req.session.userId;
    let sql ='';
    if(title == ''){
        return res.send({ success : false });
    }
    if(secret == true){
        const cryPW = GetHash(String(password));
        sql = "INSERT INTO QUESTION VALUES(NULL, '" + id + "', "+ secret + ", '" + cryPW +"', '" + title + "', '" + timestamp + "', '" + JSON.stringify(content) + "');";
    } else {
        sql = "INSERT INTO QUESTION VALUES(NULL, '" + id + "', "+ secret + ", NULL, '" + title + "', '" + timestamp + "', '" + JSON.stringify(content) + "');";
    }
    db.query(sql, function (error, results) {
        if (error) {
            console.log("QUESTION DB query error! : ", error);
            return res.send({ success : false });
        }
        return res.send({ success : true });
    })
}

router.get('/', GetQuestion);
router.delete('/', DeleteQuestion);
router.get('/detail', GetQuestionDetail);
router.get('/form', GetQuestionForm);
router.post('/form', PostQuestionForm);

module.exports = router;