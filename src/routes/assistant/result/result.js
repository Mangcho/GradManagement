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

const MakeResult = (req,res,next) =>{
    const sql = 'SELECT APPLICATION.student_id, APPLICATION.category, APPLICATION.schedule_year, APPLICATION.schedule_semester FROM APPLICATION LEFT OUTER JOIN RESULT'
    + ' ON RESULT.student_id = APPLICATION.student_id WHERE RESULT.student_id IS NULL AND APPLICATION.approval= true;';
    db.query(sql, function (error, results) {
        if (error) { // 애러 핸들링
            console.log("Application DB query error! : ", error);
            throw(error);
        }
        if(results == undefined){
        }
        else {
            let sql2 = '';
            results.forEach((value) =>{
                sql2 = 'INSERT INTO RESULT VALUES("' + value.student_id + '", ' + value.category + ', NULL, NULL, ' + value.schedule_year +', "' + value.schedule_semester + '");'; 
                db.query(sql2, function(error,results2){
                    if (error) { // 애러 핸들링
                        console.log("Application DB query error! : ", error);
                    }
                })
            })
        }
        next();  
    })
}

const GetResult = (req, res) => {
    const sql1 = 'SELECT * FROM SCHEDULE ORDER BY year DESC LIMIT 1';
    let page = req.body.page;

    if (req.query.page === undefined) {
        page = Number(1);
    }
    else {
        page = parseInt(req.query.page);
        page = Math.max(1, page);
    }

    db.query(sql1, function (error, results1) {
        if (error) { // 애러 핸들링
            console.log("DB query error at RESULT : ", error);
            return res.render(__dirname + '/../../../views/assistant/result/result.ejs', { success: false })
        }
        const sql2 = 'SELECT student_id, schedule_year, schedule_semester FROM RESULT ' +
        'WHERE schedule_year = '+ results1[0].year + ' AND schedule_semester = "' + results1[0].semester + '";';

        const sql3 = 'SELECT STUDENT.id, STUDENT.name, category, timestamp, approval, schedule_year, schedule_semester ' +
        'FROM RESULT LEFT JOIN STUDENT ' +
        'ON RESULT.student_id = STUDENT.id ' + 
        'LEFT JOIN SCHEDULE ON RESULT.schedule_year = SCHEDULE.year AND RESULT.schedule_semester = SCHEDULE.semester ' +
        'WHERE SCHEDULE.year = '+ results1[0].year + ' AND SCHEDULE.semester = "' + results1[0].semester + '" ' + 'ORDER BY approval ' +
        'LIMIT 20 OFFSET ' + Number((page - 1) * 20) + ';';

        db.query(sql2 + sql3, function (error, results2) {
            const maxPage = Math.ceil(results2[0].length / 20);
            
            if (error) { // 애러 핸들링
                console.log("DB query error at RESULT : ", error);
                return res.render(__dirname + '/../../../views/assistant/result/result.ejs', { success: false })
            }
            return res.render(__dirname + '/../../../views/assistant/result/result.ejs', { success: true, results: results1, data: results2[1], currentPage: page, maxPage: maxPage });
        })
    })
}

const PutResult = (req, res) => {
    const {isPass, data} = req.body;
    let sql;
    if(data == undefined){
        return res.send({success:false});
    }
    if(isPass == true){
        sql = 'UPDATE RESULT SET timestamp = NOW()'
        + ', approval = CASE ' 
        + 'WHEN ISNULL(approval) THEN true '
        + 'ELSE approval END '
        + 'WHERE (student_id = "';
        const a = data.join('" OR student_id = "');
        sql = sql + a + '") AND ISNULL(timestamp);';
    }
    else {
        sql = 'UPDATE RESULT SET timestamp = NOW()'
        + ', approval = CASE ' 
        + 'WHEN ISNULL(approval) THEN false '
        + 'ELSE approval END '
        + 'WHERE (student_id = "';
        const a = data.join('" OR student_id = "');
        sql = sql + a + '") AND ISNULL(timestamp);';
    }
    db.query(sql, function(error, results){
        console.log(results);
        if (error) { // 애러 핸들링
            console.log("DB query error at RESULT : ", error);
            return res.send({ success: false })
        }
        if(results.changedRows == 0){
            return res.send({ success: false });
        }
        return res.send({ success: true });
    })
}

router.get('/', MakeResult, GetResult);
router.put('/', PutResult);

module.exports = router;