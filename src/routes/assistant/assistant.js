const express = require('express');

const router = express.Router();

const GetAssistant = (req, res) => {
    res.redirect('/assistant/application');
    //res.render(__dirname + '/../../views/assistant/assistant.ejs');
}

router.get('/', GetAssistant);

module.exports = router;