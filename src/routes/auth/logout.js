const express = require('express');
const ejs = require('ejs');
const path = require('path');

const router = express.Router();


const GetLogOut = (req,res) => {
    req.session.destroy();
    res.redirect('/auth/login');
}

router.get('/', GetLogOut);

module.exports = router;