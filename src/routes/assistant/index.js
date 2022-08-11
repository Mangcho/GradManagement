const express = require('express');
const ejs = require('ejs');
const path = require('path');

const router = express.Router();


const GetAssistant = (req, res) => {
    res.render(__dirname + '/../../views/assistant/assistant.ejs');
}

router.get('/', GetAssistant);

module.exports = router;