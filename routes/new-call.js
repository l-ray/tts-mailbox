var _

var express = require('express');
var router = express.Router();
var fs=require('fs');

/* GET new call listing. */
router.post('/', function(req, res, next) {

    var from = req.body.from;
    var to = req.body.to;
    var direction = req.body.direction;
    var event = req.body.event;
    var callId = req.body.callId;
    var introFile = process.env.WAV_INTRO_INPUT || "intro.wav";
    var extroFile = process.env.WAV_EXTRO_INPUT || "extro.wav";
    var outputDir = process.env.WAV_OUTPUT_DIR || "~/Aufnahmen/";
    var inputDir = process.env.WAV_INPUT_DIR || "~/Aufnahmen/";
    var calledUrl = process.env.OUTPUT_URL || "http;//"+ req.headers.host;



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
    var phone = req.body.from;
        phone = "+"+phone;
    connection.query(
        'select ifnull(max(fn_src.value),\"Unknown\") as solution '+
        ' from oc_contacts_cards_properties as fn_src '+
        ' inner join oc_contacts_cards_properties as tel_src on tel_src.contactid=fn_src.contactid and fn_src.name=\"FN\" '+
        ' where tel_src.name=\"TEL\" and tel_src.value= ?', phone,
        function (err, rows, fields) {
            if (err) throw err;

            console.log('The solution is: ', rows[0].solution);
            var solution = rows[0].solution;
            var solutionFile = "output_"+phone+".wav";

            res.setHeader('content-type','application/xml; charset=utf-8');

            if (fs.existsSync(outputDir + solutionFile)) {
                res.render('new-call', { name: 'Express', number: solution, fileName:solutionFile});
            } else {

                var exec = require('child_process').exec,
                child = exec("espeak -v de \""+solution+"\" --stdout | ffmpeg -i "+inputDir+introFile+" -i pipe:0 -i "+inputDir+extroFile+" -filter_complex '[0:0][1:0][2:0]concat=n=3:v=0:a=1[out]' -map '[out]' -acodec pcm_s16le -ac 1 -ar 8000 "+outputDir+solutionFile, (error, stdout, stderr) => {
                        console.log(error, stdout, stderr);
                        res.render('new-call', { name: 'Express', number: solution, fileName: calledUrl+"/audio/"+solutionFile});
                })
            };
     }
    );
    connection.end();
})

module.exports = router;
