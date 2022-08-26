const express = require('express');
const multer = require('multer');
const fs = require('fs');
const db = require('../../../settings/database/config');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/upload');
    },
    filename: function (req, file, cb) {
        cb(null, req.session.userId.slice(5) + String(Date.now()));
    }
})

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb('FILE FILTER ERROR', false);
        }
    }
});

const GetApplication = (req, res) => {
    const sql = 'SELECT id, name FROM STUDENT WHERE id="' + req.session.userId + '";';
    const sql2 = 'SELECT * FROM APPLICATION LEFT JOIN SCHEDULE ON APPLICATION.schedule_year = SCHEDULE.year AND APPLICATION.schedule_semester = SCHEDULE.semester ' +
        'WHERE SCHEDULE.start < NOW() AND SCHEDULE.end > NOW() AND student_id = "' + req.session.userId + '" LIMIT 1;';
    db.query(sql, function (error, results1) {
        if (error) {
            console.log("APPLICATION DB query error! : ", error);
            return res.render(__dirname + '/../../../views/student/application/application.ejs', { success: false, myself: myself });
        }
        const myself = { id: results1[0].id, name: results1[0].name }
        db.query(sql2, function (error, results2) {
            if (error) {
                console.log("APPLICATION DB query error! : ", error);
                return res.render(__dirname + '/../../../views/student/application/application.ejs', { success: false, myself: myself });
            }
            if (results2.length == 0) {
                return res.render(__dirname + '/../../../views/student/application/application.ejs', { success: true, myself: myself, app: undefined });
            } else {
                return res.render(__dirname + '/../../../views/student/application/application.ejs', { success: true, myself: myself, app: results2[0] });
            }
        })
    })
}

const PostApplication = (req, res) => {
    if (req.file == undefined) {
        return res.send({ success: false });
    }
    let { category, inputNameArr, inputIdArr } = req.body;

    const sql = 'SELECT * FROM SCHEDULE WHERE start < NOW() AND end > NOW();';
    db.query(sql, function (error, results1) {
        if (error) {
            console.log("APPLICATION - SCHEDULE DB query error! : ", error);
            return res.send({ success: false });
        }
        console.log(results1.length);
        if(results1 == undefined){
            return res.send({ success: false });
        }

        if(results1.length == 0){
            return res.send({ success: false, limit:false });
        }
        if (category == 1) {
            inputNameArr = inputNameArr.split(',');
            inputIdArr = inputIdArr.split(',');
            if(inputNameArr.length <= 1 && inputIdArr.length <= 1){
                fs.unlinkSync(req.file.path);
                return res.send({ success: false });
            }

            const teammatesArr = [inputNameArr.slice(), inputIdArr.slice()];

            sql2 = "INSERT INTO APPLICATION VALUES(NULL, '" + req.session.userId + "', " + Number(category) + ", '" + JSON.stringify(teammatesArr) + "', '" + req.file.filename
                + "', default, NULL, NULL, " + results1[0].year + ", '" + results1[0].semester + "');";
        } else {
            sql2 = 'INSERT INTO APPLICATION VALUES(NULL, "' + req.session.userId + '", ' + Number(category) + ', NULL, "' + req.file.filename + '", default, NULL, NULL, '
                + results1[0].year + ', "' + results1[0].semester + '");';
        }
        db.query(sql2, function (error, results2) {
            if (error) {
                console.log("APPLICATION - SCHEDULE DB query error! : ", error);
                return res.send({ success: false });
            }
            if (results2 != undefined) {
                return res.send({ success: true });
            }
        })
    })
}

router.route('/')
.get(GetApplication)
.post(upload.single('applicationFile'), PostApplication)

module.exports = router;