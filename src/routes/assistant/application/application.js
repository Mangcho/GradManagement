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

const GetApplication = (req, res) => {
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
            console.log("DB query error at SCHEDULE : ", error);
            return res.render(__dirname + '/../../../views/assistant/application/application.ejs', { success: false })
        }
        const sql2 = 'SELECT student_id, schedule_year, schedule_semester FROM APPLICATION ' +
            'WHERE schedule_year = ' + results1[0].year + ' AND schedule_semester = "' + results1[0].semester + '";';

        const sql3 = 'SELECT STUDENT.id, STUDENT.name, category, teammates, file, timestamp, approval, schedule_year, schedule_semester ' +
            'FROM APPLICATION LEFT JOIN STUDENT ' +
            'ON APPLICATION.student_id = STUDENT.id ' +
            'LEFT JOIN SCHEDULE ON APPLICATION.schedule_year = SCHEDULE.year AND APPLICATION.schedule_semester = SCHEDULE.semester ' +
            'WHERE SCHEDULE.year = ' + results1[0].year + ' AND SCHEDULE.semester = "' + results1[0].semester + '" ORDER BY approval ' +
            'LIMIT 20 OFFSET ' + Number((page - 1) * 20) + ';';

        db.query(sql2 + sql3, function (error, results2) {
            if (error) { // 애러 핸들링
                console.log("DB query error at SCHEDULE : ", error);
                return res.render(__dirname + '/../../../views/assistant/application/application.ejs', { success: false })
            }
            const maxPage = Math.ceil(results2[0].length / 20);

            return res.render(__dirname + '/../../../views/assistant/application/application.ejs', { success: true, results: results1, data: results2[1], currentPage: page, maxPage: maxPage });
        })
    })
}

const PutApplication = (req, res) => {
    const { isPass, data } = req.body;
    let sql = '';
    if (isPass == true) {
        sql = 'UPDATE APPLICATION SET approval = CASE ' 
        + 'WHEN ISNULL(approval) THEN true '
        + 'ELSE approval END '
        + 'WHERE student_id = "';
        const a = data.join('" OR student_id = "');
        sql = sql + a + '";';
    } else {
        sql = 'UPDATE APPLICATION SET approval = CASE ' 
        + 'WHEN ISNULL(approval) THEN false '
        + 'ELSE approval END '
        + 'WHERE student_id = "';
        const a = data.join('" OR student_id = "');
        sql = sql + a + '";';
    }
    db.query(sql, function (error, results) {
        if (error) { // 애러 핸들링
            console.log("Application DB query error! : ", error);
            return res.send({ success: false });
        }
        if(results.changedRows == 0){
            return res.send({ success: false });
        }
        return res.send({ success: true });
    })
}


const GetApplicationDetail = (req, res) => {
    const sql = 'SELECT APPLICATION.id, student_id, STUDENT.name, category, teammates, file, timestamp, approval FROM APPLICATION ' +
        'LEFT JOIN STUDENT ON APPLICATION.student_id = STUDENT.id WHERE student_id="' + req.query.id + '";';
    db.query(sql, function (error, results) {
        if (error) { // 애러 핸들링
            console.log("DB query error! : Application Detail");
            throw error;
        }
        console.log(JSON.parse(results[0].teammates));
        const team = JSON.parse(results[0].teammates);
        return res.render(__dirname + '/../../../views/assistant/application/applicationDetail.ejs', { paper: results[0], teammates: team });
    })
}


router.get('/', GetApplication);
router.put('/', PutApplication);
router.get('/detail', GetApplicationDetail);


module.exports = router;