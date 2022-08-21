const express = require('express');
const db = require('../../../settings/database/config');

const router = express.Router();

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
        if (error) { 
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
            if (error) { 
                console.log("DB query error at SCHEDULE : ", error);
                return res.render(__dirname + '/../../../views/assistant/application/application.ejs', { success: false })
            }
            const maxPage = Math.ceil(results2[0].length / 20);

            return res.render(__dirname + '/../../../views/assistant/application/application.ejs', { success: true, results: results1, data: results2[1], currentPage: page, maxPage: maxPage });
        })
    })
}

const GetApplicationDetail = (req, res) => {
    const sql = 'SELECT APPLICATION.id, student_id, STUDENT.name, category, teammates, file, timestamp, approval, reason FROM APPLICATION ' +
        'LEFT JOIN STUDENT ON APPLICATION.student_id = STUDENT.id WHERE student_id="' + req.query.id + '";';
    db.query(sql, function (error, results) {
        if (error) { 
            console.log("DB query error! : Application Detail");
            throw error;
        }
        if(req.query.download){
            return res.download('src/public/upload/'+ results[0].file, req.query.id+'_신청서.pdf');
        }
        return res.render(__dirname + '/../../../views/assistant/application/applicationDetail.ejs', { paper: results[0]});
    })
}

const PutApplicationDetail = (req, res) => {
    const isPass = req.body.isPass;
    if(!(isPass)){
        reason = req.body.reason;
    }
    let sql = '';
    
    if (isPass == true) {
        sql = 'UPDATE APPLICATION SET approval = CASE ' 
        + 'WHEN ISNULL(approval) THEN true ELSE approval END '
        + 'WHERE student_id = "' + req.query.id + '";';
        
    } else {
        sql = 'UPDATE APPLICATION SET approval = CASE ' 
        + 'WHEN ISNULL(approval) THEN false ELSE approval END'
        + ', reason = CASE WHEN ISNULL(reason) THEN "'+ reason + '" ELSE reason END ' 
        + 'WHERE student_id = "' + req.query.id + '";';
    }
    db.query(sql, function (error, results) {
        if (error) { 
            console.log("Application DB query error! : ", error);
            return res.send({ success: false });
        }
        if(results.changedRows == 0){
            return res.send({ success: false });
        }
        return res.send({ success: true });
    })
}

router.route('/')
.get(GetApplication)

router.route('/detail')
.get(GetApplicationDetail)
.put(PutApplicationDetail)

module.exports = router;