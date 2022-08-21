const express = require('express');
const db = require('../../../settings/database/config');

const router = express.Router();

const GetCertificate = (req, res) => {

    let page = req.body.page;

    if (req.query.page === undefined) {
        page = Number(1);
    }
    else {
        page = parseInt(req.query.page);
        page = Math.max(1, page);
    }

    const sql = 'SELECT student_id FROM RESULT WHERE approval = true;';
    const sql2 = 'SELECT STUDENT.id, STUDENT.name, category, timestamp, approval, schedule_year, schedule_semester ' +
        'FROM RESULT LEFT JOIN STUDENT ON RESULT.student_id = STUDENT.id ' +
        'LEFT JOIN SCHEDULE ON RESULT.schedule_year = SCHEDULE.year AND RESULT.schedule_semester = SCHEDULE.semester ' +
        'WHERE approval = true ORDER BY schedule_year, schedule_semester LIMIT 20 OFFSET ' + Number((page - 1) * 20) + ';';

    db.query(sql + sql2, function(error, results){
        const maxPage = Math.ceil(results[0].length / 20);

        if (error) { // 애러 핸들링
            console.log("DB query error at RESULT : ", error);
            return res.render(__dirname + '/../../../views/assistant/result/certificate.ejs', { success: false })
        }
        return res.render(__dirname + '/../../../views/assistant/result/certificate.ejs', { success: true, data: results[1], currentPage: page, maxPage: maxPage });

    })
}

router.get('/', GetCertificate);

module.exports = router;