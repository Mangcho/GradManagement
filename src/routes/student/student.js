const express = require('express');

const router = express.Router();

const GetStudentMain = (req, res) => {
    res.render(__dirname + '/../../views/student/student.ejs');
}

router.get('/', GetStudentMain);

module.exports = router;