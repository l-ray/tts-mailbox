var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET new call listing. */
router.get('/', function (req, res, next) {

    var from = req.body.from;
    var introFile = process.env.WAV_INTRO_INPUT || "intro.wav";
    var extroFile = process.env.WAV_EXTRO_INPUT || "extro.wav";
    var videoFile = process.env.VIDEO_INPUT || "slideshow.mp4";
    var outputDir = process.env.WAV_OUTPUT_DIR || "~/tmp/";
    var inputDir = process.env.WAV_INPUT_DIR || "~/tmp/";
    var calledUrl = process.env.OUTPUT_URL || "http://" + req.headers.host;


    var pg = require('pg');

    var config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_LOGIN,
        password: process.env.DB_PW,
        database: process.env.DB_NAME,
        port: 5432,
        max: 10, // max number of clients in the pool
        idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
    };

    //var pool = new pg.Pool();

    var client = new pg.Client(config);

// connect to our database
    client.connect(function (err) {
        if (err) throw err;
        var solution;
        var phone = req.body.from;
        phone = "+" + phone;
        var query = client.query(
            'select * from fb_branches',
            []
        ).then(function(result){
                if (err) throw err;

                res.setHeader('content-type', 'application/xml; charset=utf-8');
                var solution = result.rows[1].city;

                console.log('The solution is: ', solution);
                var solutionFile = "output_" + solution + ".wav";


                if (fs.existsSync(outputDir + solutionFile)) {
                    res.render('new-call', {
                        name: 'Express',
                        number: solution,
                        fileName: calledUrl + "/audio/" + solutionFile
                    });
                } else {

                    var commandLine1 = "espeak -v de \"" + solution + "\" --stdout | ffmpeg -i " + inputDir + introFile + " -i pipe:0 -i " + inputDir + extroFile + " -filter_complex '[0:0][1:0][2:0]concat=n=3:v=0:a=1[out]' -map '[out]' -acodec pcm_s16le -ac 1 -ar 8000 " + outputDir + solutionFile
                    var commandLine2 = "ffmpeg -i " + outputDir + videoFile + " -i " + outputDir + solutionFile + " -c:v copy -c:a aac -strict experimental " + outputDir + "output_"+solution+".mp4"
                    var exec = require('child_process').exec,
                        child = exec(
                                    commandLine1,
                                    (error, stdout, stderr) => {
                                        exec(commandLine2,
                                        (error, stdout, stderr) => {
                                            console.log(error, stdout, stderr);
                                            res.render('new-call', {
                                                name: 'Express',
                                                number: solution,
                                                fileName: calledUrl + "/audio/" + solutionFile
                                            });
                                        })
                                });
                }
            });
        })

    })

module.exports = router;
