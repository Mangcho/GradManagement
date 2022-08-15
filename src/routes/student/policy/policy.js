const express = require('express');
const router = express.Router();

const GetPolicy = (req, res) => {
    return res.render(__dirname + '/../../../views/student/policy/policy.ejs');
}

router.get('/', GetPolicy);

module.exports = router;