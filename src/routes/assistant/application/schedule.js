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
});

const GetSchedule = (req, res) => {
    const sql = 'SELECT * FROM SCHEDULE ORDER BY year DESC LIMIT 1'
    db.query(sql, function (error, results) {
        if (error) { // 애러 핸들링
            console.log("DB query error at SCHEDULE : ", error);
            return res.render(__dirname + '/../../../views/assistant/application/schedule.ejs', { success: false })
        }
        return res.render(__dirname + '/../../../views/assistant/application/schedule.ejs', { success: true, results: results });
    })
}

const PutSchedule = (req, res) => {
    const { inputYear, inputSemester, inputStartDate, inputEndDate } = req.body;
    const sql1 = "SELECT * FROM SCHEDULE WHERE year = " + inputYear + " AND semester = '" + inputSemester + "';";

    db.query(sql1, function (error, results) {
        if (error) { // 애러 핸들링
            console.log("DB query error at SCHEDULE : ", error);
            return res.send({ success: false })
        }
        if (results === undefined) {
            return res.send({ success: false })
        } else {
            const sql2 = "INSERT INTO SCHEDULE (year, semester, start, end)" +
                "VALUES (" + inputYear + ", '" + inputSemester + "', '" + inputStartDate + "', '" + inputEndDate + "')" +
                "ON DUPLICATE KEY UPDATE start = '" + inputStartDate + "', end = '" + inputEndDate + "';";
            db.query(sql2, function (error, results) {
                if (error) { // 애러 핸들링
                    console.log("DB query error at SCHEDULE : ", error);
                    throw error;
                }
                const data = [{year : inputYear, semester : inputSemester, start : inputStartDate,  end : inputEndDate}];
                if (results === undefined) {
                    return res.send({ success: false })
                }
                else if (results.affectedRows == 1) {
                    return res.send({ success: true, results: data });
                }
                else {
                    return res.send({ success: true, results: data });
                }
            })
        }
    })
}

router.get('/', GetSchedule);
router.put('/', PutSchedule);


module.exports = router;