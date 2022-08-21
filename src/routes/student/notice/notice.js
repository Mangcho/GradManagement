const express = require('express');
const db = require('../../../settings/database/config');

const router = express.Router();

const GetNotice = (req, res) => {
    let page = req.body.page;
    if (req.query.page === undefined) {
        page = Number(1);
    }
    else {
        page = parseInt(req.query.page);
        page = Math.max(1, page);
    }

    if (req.query.search === undefined) {
        sql2 = 'SELECT id, title, timestamp FROM NOTICE ORDERS LIMIT 20 ' + 'OFFSET ' + Number((page - 1) * 20) + ';';
    }
    else {
        sql2 = 'SELECT id, title, timestamp FROM NOTICE WHERE title LIKE "%' + req.query.search + '%";';
    }

    const sql1 = 'SELECT id FROM NOTICE;';
    db.query(sql1 + sql2, function (error, results) {
        if (error) { 
            console.log("NOTICE DB query error! ", error);
            throw error;
        }
        const numOfNotice = results[0].length;
        const maxPage = Math.ceil(numOfNotice / 20);
        return res.render(__dirname + '/../../../views/student/notice/notice.ejs', { results: results[1], currentPage: page, maxPage: maxPage });
    })
}

const GetNoticeDetail = (req,res) => {
    const sql = 'SELECT id, title, timestamp, content FROM NOTICE WHERE id=' + req.query.id + ';';
    db.query(sql, function (error, results) {
        if (error) { 
            console.log("DB query error!");
            throw error;
        }
        return res.render(__dirname + '/../../../views/student/notice/noticeDetail.ejs', { result: results[0]});
    })
}

router.get('/', GetNotice);
router.get('/detail', GetNoticeDetail);

module.exports = router;