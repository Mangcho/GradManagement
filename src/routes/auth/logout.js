const express = require('express');

const router = express.Router();

const GetLogOut = (req,res) => {
    req.session.destroy();
    res.redirect('/auth/login');
}

router.get('/', GetLogOut);

module.exports = router;