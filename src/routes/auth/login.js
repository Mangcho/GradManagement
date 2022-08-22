const express = require('express');
const db = require('../../settings/database/config');
const crypto = require('../../utils/cryptPassword');

const router = express.Router();

const GetLogin = (req, res) => {
    if(String(req.headers["user-agent"]).search("rv:11.0") > -1|| String(req.headers["user-agent"]).search("MSIE") > -1){
        res.render(__dirname + '/../../views/common/ie.ejs');
    }
    else {
        res.render(__dirname + '/../../views/common/login.ejs', {success : true});
    }
}

const PostLogin = (req, res) => {
    const { Input_ID, Input_PW } = req.body;
    const HashPW = crypto.GetHash(Input_PW);

    if(Input_ID == '' || Input_PW =='') {
        //Already checked in client 
        return res.status(401).end();
    }
    
    sql_str =  "SELECT id, password, state FROM STUDENT WHERE id='" + Input_ID + "' AND password='" + HashPW + "';";
    db.query(sql_str, function(error, results) {

        if(error){ 
            console.log("DB query error!");
            throw error;
        }

        if(results.length <= 0){ // no auth
            return res.send({ success:false });
        }
        else {
            if(results[0].state === 0){ // admin
                req.session.auth = 99;
                req.session.state = results[0].state;
                req.session.userId = results[0].id;
                return res.send({success:true, state:results[0].state});
            }
            else if(results[0].state === 1){ // student
                req.session.auth = 99;
                req.session.state = results[0].state;
                req.session.userId = results[0].id;
                return res.send({success:true, state:results[0].state});
            }
            else { // can't use
                return res.send({state:results[0].state});
            }
        }
        });
}

router.route('/')
.get(GetLogin)
.post(PostLogin)

module.exports = router;