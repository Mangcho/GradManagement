const express = require('express');
const excel = require('exceljs');
const db = require('../../../settings/database/config');

const router = express.Router();

const GetCertificate = (req, res) => {
    let page = req.body.page;
    let sql = '';
    let sql2 = '';

    if (req.query.page === undefined) {
        page = Number(1);
    }
    else {
        page = parseInt(req.query.page);
        page = Math.max(1, page);
    }
    if(req.query.search == undefined){
        sql = 'SELECT student_id FROM RESULT WHERE approval = true;';
        sql2 = 'SELECT STUDENT.id, STUDENT.name, category, timestamp, approval, schedule_year, schedule_semester ' +
        'FROM RESULT LEFT JOIN STUDENT ON RESULT.student_id = STUDENT.id ' +
        'LEFT JOIN SCHEDULE ON RESULT.schedule_year = SCHEDULE.year AND RESULT.schedule_semester = SCHEDULE.semester ' +
        'WHERE approval = true ORDER BY schedule_year, schedule_semester LIMIT 20 OFFSET ' + Number((page - 1) * 20) + ';';
    } else {
        sql = 'SELECT student_id FROM RESULT WHERE approval = true AND student_id like "%' +req.query.search + '%";';
        sql2 = 'SELECT STUDENT.id, STUDENT.name, category, timestamp, approval, schedule_year, schedule_semester ' +
        'FROM RESULT LEFT JOIN STUDENT ON RESULT.student_id = STUDENT.id ' +
        'LEFT JOIN SCHEDULE ON RESULT.schedule_year = SCHEDULE.year AND RESULT.schedule_semester = SCHEDULE.semester ' +
        'WHERE approval = true AND STUDENT.id like "%' +req.query.search + 
        '%" ORDER BY schedule_year, schedule_semester;';
    }

    db.query(sql + sql2, function (error, results) {
        const maxPage = Math.ceil(results[0].length / 20);
        if (error) {
            console.log("DB query error at RESULT : ", error);
            return res.render(__dirname + '/../../../views/assistant/result/certificate.ejs', { success: false })
        }
        return res.render(__dirname + '/../../../views/assistant/result/certificate.ejs', { success: true, data: results[1], currentPage: page, maxPage: maxPage });
    })
}

const GetCertificateprint = (req, res) => {
    const sql = 'SELECT RESULT.student_id, STUDENT.name, category, approval, timestamp, SCHEDULE.year, SCHEDULE.semester, SCHEDULE.start, SCHEDULE.end '
        + 'FROM RESULT LEFT JOIN SCHEDULE ON RESULT.schedule_year = SCHEDULE.year AND RESULT.schedule_semester = SCHEDULE.semester '
        + 'LEFT JOIN STUDENT ON RESULT.student_id = STUDENT.id '
        + 'WHERE SCHEDULE.start < NOW() AND SCHEDULE.end > NOW() AND approval = true';
    db.query(sql, function (error, results) {
        if (error) {
            console.log("DB query error at RESULT : ", error);
            return res.send({ success: false });
        }
        if(results == undefined || results.length == 0){
            return res.send("입력된 명단이 없습니다!");
        }
        const workbook = new excel.Workbook();
        workbook.creator = '가천대학교 컴퓨터공학과';
        workbook.views = [
            {
                x: 0, y: 0, width: 10000, height: 20000,
                firstSheet: 0, activeTab: 1, visibility: 'visible'
            }
        ]
        let sheet = workbook.addWorksheet(results[0].year + '년 ' + results[0].semester + '학기');
        sheet = workbook.worksheets[0];
        sheet.columns = [
            { header: '학번', key: 'id', width: 10 },
            { header: '이름', key: 'name', width: 10 },
            { header: '인증종류', key: 'category', width: 10 },
            { header: '승인시각', key: 'timestamp', width: 20 }
        ]

        results.forEach(function(arr){
            let temp = '';
            if(arr.category == 0){
                temp = '졸업논문';
            } else if(arr.category == 1){
                temp = '졸업작품';
            } else if(arr.category == 2){
                temp = '장기현장실습';
            } else if(arr.category == 3){
                temp = '학생창업';
            } else {
                temp = 'ERROR';
            }
            sheet.addRow({id:arr.student_id, name:arr.name, category: temp, timestamp:arr.timestamp});
        })

        // Writing in buffer
        res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment("Report.xlsx");
        workbook.xlsx.write(res)
            .then(function (data) {
                res.end();
            });
    })
}

router.get('/', GetCertificate);
router.get('/print', GetCertificateprint);

module.exports = router;