const express = require('express');
const db = require('../../settings/database/config');
const crypto = require('../../utils/cryptPassword');

const router = express.Router();

const GetAssistantAuth = (req, res) => {
    const maxStudent = 20;
    let page;
    let sql1 ='';
    let sql2 = '';

    if (req.query.page === undefined) {
        page = Number(1);
    }
    else {
        page = parseInt(req.query.page);
        page = Math.max(1, page);
    }

    if (req.query.search === undefined) {
        sql1 = 'SELECT name, id, state FROM STUDENT;';
        sql2 = 'SELECT name, id, state FROM STUDENT ORDERS LIMIT ' + maxStudent + ' OFFSET ' + Number((page - 1) * maxStudent) + ';';
    }
    else {
        sql1 = 'SELECT name, id, state FROM STUDENT WHERE id LIKE "%' + req.query.search + '%";';
        sql2 = 'SELECT name, id, state FROM STUDENT WHERE id LIKE "%' + req.query.search + '%";';
    }

    db.query(sql1 + sql2, function (error, results) {
        if (error) {
            console.log("DB query error!");
            throw error;
        }
        const numOfStudents = results[0].length;
        const maxPage = Math.ceil(numOfStudents / maxStudent);
        return res.render(__dirname + '/../../views/assistant/auth/auth.ejs', { results: results[1], currentPage: page, maxPage: maxPage });
    })
}

const GetStudentDetail = (req, res) => {
    const sql = 'SELECT name, id, state, phone_num, email FROM STUDENT WHERE id=' + req.query.id + ';';
    db.query(sql, function (error, results) {
        if (error) { 
            console.log("DB query error!");
            throw error;
        }
        return res.render(__dirname + '/../../views/assistant/auth/idDetail.ejs', { result: results[0]});
    })
}

const PutStudentDetail = (req, res) => {
    const { Input_id, Input_name, Input_phone, Input_email, Input_state } = req.body;

    let state_Num;
    if (Input_state === '관리자') {
        state_Num = 0;
    }
    else if (Input_state === '재학') {
        state_Num = 1;
    }
    else {
        state_Num = 2;
    }

    const sql = 'UPDATE STUDENT SET name = "' + Input_name + '", phone_num = "' + Input_phone
        + '", email = "' + Input_email + '", state = ' + state_Num + ' WHERE id = "' + Input_id + '"';

    db.query(sql, function (error, results) {
        if (error) { 
            console.log("DB query error!");
            throw error;
        }
        if (results.affectedRows <= 0) {
            return res.send({ success: false });
        }
        else if (results.affectedRows === 1) {
            return res.send({ success: true })
        }
        else {
            return res.end(500);
        }
    })
}

const GetPasswordReset = (req, res) => {
    return res.render(__dirname + '/../../views/assistant/auth/reset.ejs')
}

const PutPasswordReset = (req, res) => {
    const Input_ID = req.body.Input_ID;
    const idChecker = /^[\d]{9}$/g;
    const cryPW = crypto.GetHash(String(Input_ID));

    if (String(Input_ID).search(idChecker) > -1) {
        const sql = "UPDATE STUDENT SET password ='"+ cryPW + "'WHERE id = '" + Input_ID + "';";

        db.query(sql, function (error, results) {
            if (error) { 
                console.log("DB query error! : ", error);
                return res.send({ success: false })
            }
            return res.send({ success: true })
        })
    }
    else {
        return res.send({ success: false })
    }
}

router.get('/', GetAssistantAuth);
router.route('/password')
.get(GetPasswordReset)
.put(PutPasswordReset)

router.route('/detail')
.get(GetStudentDetail)
.put(PutStudentDetail)

module.exports = router;