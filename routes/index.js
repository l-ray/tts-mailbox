var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');


/* GET home page. */
router.get('/', function(req, res, next) {
    var from = req.body.from;
    var to = req.body.to;
    var direction = req.body.direction;

    console.log("database-host:"+process.env.DB_HOST);
    console.log("database:"+process.env.DB_NAME);
    console.log("database-login:"+process.env.DB_LOGIN);
    console.log("database-pw:"+process.env.DB_PW);

    console.log("from: " + from);
    console.log("to: " + to);
    console.log("direction: " + direction);

    res.render('index', { title: req.body.from });
});

/* GET home page. */
router.post('/', function(req, res, next) {
    var from = req.body.from;
    var to = req.body.to;
    var direction = req.body.direction;

    console.log("from: " + from);
    console.log("to: " + to);
    console.log("direction: " + direction);

    res.render('index', { title: req.body.from });
});


module.exports = router;
