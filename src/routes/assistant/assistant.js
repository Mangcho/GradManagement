const express = require('express');

const router = express.Router();

const GetAssistant = (req, res) => {
    res.render(__dirname + '/../../views/assistant/assistant.ejs');
}

router.get('/', GetAssistant);

module.exports = router;