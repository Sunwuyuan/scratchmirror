var express = require('express');
var router = express.Router();

const request = require("request");

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get("/asdm", function (req, res) {
    request({
        url: "https://api.github.com/repos/sunwuyuan/AutoScratchDesktopMirror/releases/latest",
        method: "GET",
    }, function (error, response, body) {
        //console.log(body);
        if (!error && response.statusCode == 200) {
            res.status(200).send(body);
        }
    })
});


module.exports = router;
