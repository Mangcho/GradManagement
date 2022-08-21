const express = require('express');
const multer = require('multer');
const excel = require('exceljs');
const fs = require('fs');
const crypto = require('node:crypto');
const db = require('../../settings/database/config');

const router = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/templates/input')
    },
    filename: function (req, file, cb) {
        // example : uploaded_85_104222
        let time = new Date();
        let timestamp = '_';
        timestamp += String(time.getMonth() + 1);
        timestamp += String(time.getDate());
        timestamp += '_';
        timestamp += String(time.getHours());
        timestamp += String(time.getMinutes());
        timestamp += String(time.getSeconds());

        cb(null, file.fieldname + timestamp);
    },
    fileFilter: function (req, file, cb) {
        // Only Accept .xlsx
        if (file.mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
})

const upload = multer({
    storage: storage
});

const GetHash = (data) => {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

const GetRegistration = (req, res) => {
    fs.readdir('src/public/templates/input', (err, files) => {
        if (err) throw err;

        for (const file of files) {
            try {
                fs.unlinkSync('src/public/templates/input/' + file);
            }
            catch (error) {
                console.error(error)
            }
        }
    });
    return res.render(__dirname + '/../../views/assistant/auth/registration.ejs');
}

const PostRegistration = (req, res) => {
    let results = new Array;

    if (req.file.mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        fs.readdir('src/public/templates/input', { withFileTypes: true }, (err, files) => {
            if (err) {
                console.error(err);
                return;
            }
            const workbook = new excel.Workbook();
            workbook.xlsx.readFile('src/public/templates/input/' + files[0].name)
                .then(function () {
                    const worksheet = workbook.getWorksheet('List');
                    const idChecker = /^[0-9]{9}/g;

                    let count = 1;
                    let finish = 0;

                    finish = worksheet.actualRowCount;

                    worksheet.eachRow(function (row, rowNumber) {
                        let lineData = new Array;
                        if (!(rowNumber == 1)) {

                            row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                                if (typeof (cell.value) == 'object') {
                                    lineData.push(cell.value.text);
                                }
                                else {
                                    lineData.push(cell.value);
                                }
                            }) // eachCell ends

                            if (String(lineData[0]).search(idChecker) > -1) {
                                const encyPW = GetHash(String(lineData[0]));
                                const sql = "INSERT INTO STUDENT VALUE('" + lineData[0] + "', '" + lineData[1] + "', '" + encyPW + "', 1 , '" + lineData[2] + "', '" + lineData[3] + "');";

                                db.promise().execute(sql)
                                    .then(([rows, fields]) => {
                                        if (rows.affectedRows == 1) {
                                            lineData.push(true);
                                            results.push(lineData.slice());
                                            count++;
                                            if (count == finish) {
                                                return res.render(__dirname + '/../../views/assistant/auth/resultRegistration.ejs', { sucess: true, results: results });
                                            }
                                        }
                                        else {
                                            results.push(lineData.slice());
                                            count++;
                                            if (count == finish) {
                                                return res.render(__dirname + '/../../views/assistant/auth/resultRegistration.ejs', { sucess: true, results: results });
                                            }
                                        }
                                    })
                                    .catch((error) => {
                                        console.log("DB error :", error.sqlMessage);
                                        lineData.push(false);
                                        lineData.push(error.sqlMessage.slice());
                                        results.push(lineData.slice());
                                        count++;
                                        if (count == finish) {
                                            return res.render(__dirname + '/../../views/assistant/auth/resultRegistration.ejs', { sucess: true, results: results });
                                        }
                                    })
                            }
                            else {
                                lineData.push(false);
                                lineData.push('ID is Wrong');
                                results.push(lineData.slice());
                                count++;
                                if (count == finish) {
                                    return res.render(__dirname + '/../../views/assistant/auth/resultRegistration.ejs', { sucess: true, 'results': results });
                                }
                            }
                        }
                    }); // eachRow ends
                }) // then ends
                .catch((error) => console.error(error))
        }); //fs ends
    } else {
        return res.render(__dirname + '/../../views/assistant/auth/resultRegistration.ejs', { sucess: false })
    }
}

const GetTemplateFile = (req, res) => {
    return res.download('/home/sjkim/GradManagement/src/public/templates/학생_계정_추가_양식.xlsx');
}

router.route('/')
.get(GetRegistration)
.post(upload.single('uploaded_file'), PostRegistration)

router.get('/download', GetTemplateFile);

module.exports = router;