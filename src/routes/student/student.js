const express = require('express');
const db = require('../../settings/database/config');

const router = express.Router();

const GetStudentMain = (req, res) => {
    const sql = 'SELECT * FROM SCHEDULE WHERE start <= NOW() AND end >= NOW();';
    const sql2 = 'SELECT * FROM NOTICE ORDER BY id DESC LIMIT 7;';
    
    db.query(sql + sql2, function(error, results){
        if (error) { 
            console.log("STUDENT MAIN DB query error : ", error);
            return res.render(__dirname + '/../../views/student/student.ejs', { success: false });
        }
        if(results == undefined){
            return res.render(__dirname + '/../../views/student/student.ejs', { success: false });
        }
        else if(results.length == 0 ){
            return res.render(__dirname + '/../../views/student/student.ejs', { success: true, term: false });
        }
        return res.render(__dirname + '/../../views/student/student.ejs', { success: true, term: true, schedule:results[0][0], noticeList:results[1] });
    })
}

router.get('/', GetStudentMain);

module.exports = router;