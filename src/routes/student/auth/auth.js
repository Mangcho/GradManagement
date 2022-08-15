const express = require('express');
const crypto = require('node:crypto');
const mysql = require('mysql2');

const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    multipleStatements: true
});

const GetHash = (data) => {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

const GetAuth = (req, res) => {
    const sql = 'SELECT name, id, phone_num, email FROM STUDENT WHERE id=' + req.session.userId + ';';
    db.query(sql, function (error, results) {
        if (error) {
            console.log("AUTH DB query error! : ", error);
            throw error;
        }
        return res.render(__dirname + '/../../../views/student/auth/auth.ejs', { result: results[0] });
    })
}

const PutAuth = (req, res) => {
    const { Input_id, Input_phone, Input_email } = req.body;
    const sql = 'UPDATE STUDENT SET phone_num = "' + Input_phone + '", email = "' + Input_email + '" WHERE id = "' + req.session.userId + '"';

    db.query(sql, function (error, results) {
        if (error) {
            console.log("AUTH DB query error! : ", error);
            throw error;
        }
        if (results.affectedRows <= 0) {
            return res.send({ success: false });
        }
        else if (results.affectedRows === 1) {
            return res.send({ success: true })
        }
        else {
            return res.end(500);
        }
    })

}

const GetPassword = (req, res) => {
    return res.render(__dirname + '/../../../views/student/auth/password.ejs');

}

const PutPassword = (req, res) => {
    const { currentPassword, newPassword, newPasswordRepeat } = req.body;
    const cryCureentPassword = GetHash(String(currentPassword));
    const validSql = "SELECT id, password FROM STUDENT WHERE id= '" + req.session.userId + "'"

    db.query(validSql, function (error, result) {
        if (error) {
            console.log("AUTH DB query error! : ", error);
            return res.send({ success: false, match: false });
        }
        if (result[0].password != String(cryCureentPassword)) {
            return res.send({ success: true, match: false });
        } else {
            const cryNewPassword = GetHash(String(newPassword));
            const cryNewPasswordRepeat = GetHash(String(newPasswordRepeat));

            if (cryNewPassword === cryNewPasswordRepeat) {
                const sql = "UPDATE STUDENT SET password ='" + cryNewPassword + "'WHERE id = '" + req.session.userId + "';";

                db.query(sql, function (error, results) {
                    console.log(results);
                    if (error) {
                        console.log("AUTH DB query error! : ", error);
                        return res.send({ success: false, match: true });
                    }
                    if (results.affectedRows == 1 && results.changedRows == 1) {
                        return res.send({ success: true, match: true });
                    } else {
                        return res.send({ success: false, match: true });
                    }
                })
            } else {
                return res.send({ success: false, match: false })
            }
        }
    })


}





router.get('/', GetAuth);
router.put('/', PutAuth);
router.get('/password', GetPassword);
router.put('/password', PutPassword);

module.exports = router;