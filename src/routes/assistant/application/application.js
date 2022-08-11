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

    db.query(sql1, function (error, results1) {
        if (error) { // 애러 핸들링
            console.log("DB query error at SCHEDULE : ", error);
            return res.render(__dirname + '/../../../views/assistant/application/application.ejs', { success: false })
        }
        const sql2 = 'SELECT STUDENT.id, STUDENT.name, category, teammates, file, timestamp, approval, schedule_year, schedule_semester ' +
        'FROM APPLICATION LEFT JOIN STUDENT ' +
        'ON APPLICATION.student_id = STUDENT.id ' + 
        'LEFT JOIN SCHEDULE ON APPLICATION.schedule_year = SCHEDULE.year AND APPLICATION.schedule_semester = SCHEDULE.semester ' +
        'WHERE SCHEDULE.year = '+ results1[0].year + ' AND SCHEDULE.semester = "' + results1[0].semester + '";'
        db.query(sql2, function (error, results2) {
            console.log('results1 : ', results1);
            console.log('results2 : ', results2);
            if (error) { // 애러 핸들링
                console.log("DB query error at SCHEDULE : ", error);
                return res.render(__dirname + '/../../../views/assistant/application/application.ejs', { success: false })
            }
            return res.render(__dirname + '/../../../views/assistant/application/application.ejs', { success: true, results: results1, data: results2 });
        })
        
        
    })
}

router.get('/', GetApplication);


module.exports = router;