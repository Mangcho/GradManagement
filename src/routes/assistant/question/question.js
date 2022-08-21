const express = require('express');
const db = require('../../../settings/database/config');

const router = express.Router();

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
        if (error) { 
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
    if (data == undefined) {
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

const GetQuestionDetail = (req, res) => {
    const sql = 'SELECT QUESTION.id, secret, title, student_id, STUDENT.name, STUDENT.state, timestamp, content FROM QUESTION ' +
        'LEFT JOIN STUDENT ON QUESTION.student_id = STUDENT.id WHERE QUESTION.id="' + req.query.id + '";';
    const sql2 = 'SELECT student_id, STUDENT.name, STUDENT.state, timestamp, content FROM COMMENT LEFT JOIN STUDENT ON COMMENT.student_id = STUDENT.id WHERE question_id = ' + req.query.id + ';';
    db.query(sql + sql2, function (error, results) {
        if (error) {
            console.log("DB query error!");
            throw error;
        }
        console.log(results[0][0].title);
        console.log(results[1]);
        return res.render(__dirname + '/../../../views/assistant/question/questionDetail.ejs', { post: results[0][0], comments: results[1] });
    })
}

const PostQuestionComment = (req, res) => {
    const { content, timestamp } = req.body;
    const student_id = req.session.userId;
    const question_id = req.query.id;

    if (content == '') {
        return res.send({ success: false });
    }
    let sql = 'SELECT question_id, id FROM COMMENT WHERE question_id = ' + question_id + ';';
    let sql2 = '';

    db.query(sql, function (error, results1) {
        if (error) {
            console.log("COMMENT DB query error! : ", error);
            return res.send({ success: false });
        }
        console.log(results1);
        if (results1 == undefined) {
            sql2 = "INSERT INTO COMMENT VALUES(" + question_id + ", 1, '" + student_id + "', '" + timestamp + "', '" + JSON.stringify(content) + "');";
        }
        else {
            sql2 = "INSERT INTO COMMENT VALUES(" + question_id + ", " + results1.length + 1 + ", '" + student_id + "', '" + timestamp + "', '" + JSON.stringify(content) + "');";
        }
        db.query(sql2, function (error, results2) {
            if (error) {
                console.log("COMMENT DB query error! : ", error);
                return res.send({ success: false });
            }
            return res.send({ success: true });
        })
    })
}


const GetQuestionForm = (req, res) => {
    return res.render(__dirname + '/../../../views/assistant/question/questionForm.ejs');
}

const PostQuestionForm = (req, res) => {
    const { title, secret, content, timestamp } = req.body;
    const id = req.session.userId;
    let sql = '';
    if (title == '') {
        return res.send({ success: false });
    }
    sql = "INSERT INTO QUESTION VALUES(NULL, '" + id + "', " + secret + ", NULL, '" + title + "', '" + timestamp + "', '" + JSON.stringify(content) + "');";

    db.query(sql, function (error, results) {
        if (error) {
            console.log("QUESTION DB query error! : ", error);
            return res.send({ success: false });
        }
        return res.send({ success: true });
    })
}

router.route('/')
.get(GetQuestion)
.delete(DeleteQuestion)

router.route('/detail')
.get(GetQuestionDetail)
.post(PostQuestionComment)

router.route('/form')
.get(GetQuestionForm)
.post(PostQuestionForm)

module.exports = router;