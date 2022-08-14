const crypto = require('node:crypto');
const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql2');
const path = require('path');

const router = express.Router();

// DB 연결
const db = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME
});

const GetLogin = (req, res) => {
    if(String(req.headers["user-agent"]).search("rv:11.0") > -1|| String(req.headers["user-agent"]).search("MSIE") > -1){
        res.render(__dirname + '/../../views/common/ie.ejs');
    }
    else {
        res.render(__dirname + '/../../views/common/login.ejs', {success : true});
    }
    
}

const GetHash = (data) => {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

const PostLogin = (req, res) => {
    const { Input_ID, Input_PW } = req.body;
    const HashPW = GetHash(Input_PW);

    if(Input_ID == '' || Input_PW =='') {
        //Already checked in client 
        return res.status(401);
    }
    
    sql_str =  "SELECT id, password, state FROM STUDENT WHERE id='" + Input_ID + "' AND password='" + HashPW + "';";
    db.query(sql_str, function(error, results, fields) {

        if(error){ // 애러 핸들링
            console.log("DB query error!");
            throw error;
        }

        if(results.length <= 0){ // 아이디나 비밀번호가 DB에 존재하지 않을경우
            return res.send({success:false});
        }
        else {
            if(results[0].state === 0){ //admin일 경우
                req.session.auth = 99;
                req.session.state = results[0].state;
                req.session.userId = results[0].id;
                return res.send({success:true, state:results[0].state});
            }
            else if(results[0].state === 1){
                req.session.auth = 99;
                req.session.state = results[0].state;
                req.session.userId = results[0].id;
                return res.send({success:true, state:results[0].state});
            }
            else {
                return res.send({state:results[0].state});
            }
        }
        });
}

router.get('/', GetLogin);
router.post('/', PostLogin);

module.exports = router;