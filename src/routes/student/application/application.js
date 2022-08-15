const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');

const router = express.Router();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONN_LIMIT,
    multipleStatements: true
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/templates/policy')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname +'.pdf');
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype == 'application/pdf') {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
})

const upload = multer({
    storage: storage
});


const GetApplication = (req, res) => {
    const sql = 'SELECT id, name FROM STUDENT WHERE id="' + req.session.userId + '";';
    const sql2 = 'SELECT * FROM APPLICATION LEFT JOIN SCHEDULE ON APPLICATION.schedule_year = SCHEDULE.year AND APPLICATION.schedule_semester = SCHEDULE.semester ' +
    'WHERE SCHEDULE.start < NOW() AND SCHEDULE.end > NOW() AND student_id = "'+ req.session.userId + '" LIMIT 1;';
    db.query(sql, function(error, results1){
        if(error){
            console.log("APPLICATION DB query error! : ", error);
            return res.render(__dirname + '/../../../views/student/application/application.ejs', {success : false, myself:myself});
        }
        const myself = {id : results1[0].id, name : results1[0].name}
        // state -1  -> NO app  state 0 -> 심사중 state 1 -> 승인 state 2 -> 거부]
        db.query(sql2, function(error, results2){
            if(error){
                console.log("APPLICATION DB query error! : ", error);
                return res.render(__dirname + '/../../../views/student/application/application.ejs', {success : false, myself:myself});
            }
            if(results2.length == 0){
                return res.render(__dirname + '/../../../views/student/application/application.ejs', {success : true, myself:myself, state:-1});
            } else {
                return res.render(__dirname + '/../../../views/student/application/application.ejs', {success : true, myself:myself, app:results2[0], state:1});
            }
        })   
    })
}

const PostApplication = (req, res) => {

}





router.get('/', GetApplication);
router.post('/', upload.single('applicationFile') ,PostApplication);

module.exports = router;