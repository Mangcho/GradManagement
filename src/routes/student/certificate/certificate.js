const express = require('express');
const mysql = require('mysql2');

const router = express.Router();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    dateStrings: true, // return DATE type
    multipleStatements: true
});


const GetCertificate = (req, res) => {

    const sql = 'SELECT student_id, STUDENT.name, category, approval, timestamp, schedule_year, schedule_semester FROM RESULT '+ 
    'LEFT JOIN STUDENT ON RESULT.student_id = STUDENT.id WHERE id= "' + req.session.userId + '" AND approval = true;';
    const sql2 = 'SELECT id, name FROM STUDENT WHERE id = "' + req.session.userId + '";';
    db.query(sql + sql2, function (error, results) {
        if (error) {
            // Connection error 
            console.log("CERTIFICATE DB query error! : ", error);
            return res.render(__dirname + '/../../../views/student/certificate/certificate.ejs', {success:false, result: results[0][0], info:results[1][0] });
        }
        if(results[0][0] == undefined){
            // No Certificate
            return res.render(__dirname + '/../../../views/student/certificate/certificate.ejs', { success:true, result: results[0][0], info:results[1][0] });
        } else if(results[0].length == 1){
            // Certoficated
            return res.render(__dirname + '/../../../views/student/certificate/certificate.ejs', { success:true, result: results[0][0], info:results[1][0] });
        } else {
            // else
            return res.render(__dirname + '/../../../views/student/certificate/certificate.ejs', { success:false, result: results[0][0], info:results[1][0] });
        }
    })
}






router.get('/', GetCertificate);

module.exports = router;