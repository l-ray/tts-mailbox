var _

var express = require('express');
var router = express.Router();
var fs=require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_LOGIN,
        password: process.env.DB_PW,
        database: process.env.DB_NAME,
        port: 3306
    });

    connection.connect();
    var solution;
    var phone = req.query.name;
    connection.query(
        'select ifnull(max(fn_src.value),\"Unknown\") as solution '+
        ' from oc_contacts_cards_properties as fn_src '+
        ' inner join oc_contacts_cards_properties as tel_src on tel_src.contactid=fn_src.contactid and fn_src.name=\"FN\" '+
        ' where tel_src.name=\"TEL\" and tel_src.value=\"'+phone+'\"',
        function (err, rows, fields) {
            if (err) throw err;

            console.log('The solution is: ', rows[0].solution);
            var solution = rows[0].solution;
            var solutionFile = "public/output_"+phone+".wav";

            if (fs.existsSync(solutionFile)) {
                res.render('users', { name: 'Express', number: solution, fileName:solutionFile});
            } else {

                var exec = require('child_process').exec,
                child = exec("espeak -v de \""+solution+"\" --stdout | ffmpeg -i ~/Aufnahmen/intro.wav -i pipe:0 -i ~/Aufnahmen/intro.wav -filter_complex '[0:0][1:0][2:0]concat=n=3:v=0:a=1[out]' -map '[out]' -acodec pcm_s16le -ac 1 -ar 8000 "+solutionFile, (error, stdout, stderr) => {
                        console.log(error, stdout, stderr);
                res.render('users', { name: 'Express', number: solution, fileName:solutionFile});
                // res.sendfile("output_"+phone+".wav");
                })
            };

             // ffmpeg -i intro.wav -i pipe:0 -i intro.wav -filter_complex '[0:0][1:0][2:0]concat=n=3:v=0:a=1[out]' -map '[out]' -acodec pcm_s16le -ac 1 -ar 8000 output_lennart_8ble_alina.wav
     }
    );

    connection.end();

})

module.exports = router;
