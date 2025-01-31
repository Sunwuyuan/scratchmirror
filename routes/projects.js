var express = require('express');
var router = express.Router();

const request = require("request");

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get("/explore/projects", function (req, res) {
    request({
        url: "https://api.scratch.mit.edu/explore/projects",
        qs: {
            limit: req.query.limit || 16,
            language: req.query.language || 'zh-cn',
            mode: req.query.mode || 'popular',
            q: req.query.q || '*',
            offset: req.query.offset || 0,
        },
        method: "GET",
    }, function (error, response, body) {
        //console.log(body);
        if (!error && response.statusCode == 200) {
            res.status(200).send(body);
        }else {
            res.status(404).send("Not Found");
        }
    })
});

router.get("/search/projects", function (req, res) {
    request({
        url: "https://api.scratch.mit.edu/search/projects",
        qs: {
            limit: req.query.limit || 16,
            language: req.query.language || 'zh-cn',
            mode: req.query.mode || 'popular',
            q: req.query.q || '*',
            offset: req.query.offset || 0,
        },
        method: "GET",
    }, function (error, response, body) {
        //console.log(body);
        if (!error && response.statusCode == 200) {
            res.status(200).send(body);
        }else {
            res.status(404).send("Not Found");
        }
    })
});
router.get("/source/:id", function (req, res) {
    request({
        url: `https://projects.scratch.mit.edu/${req.params.id}?token=${req.query.token}`,
        method: "GET",
    }, function (error, response, body) {
        //console.log(body);
        if (!error && response.statusCode == 200) {
            res.status(200).send(body);
        }else {
            res.status(404).send("Not Found");
        }
    })
});

router.get("/:id", function (req, res) {
    request({
        url: `https://api.scratch.mit.edu/projects/${req.params.id}/`,
        method: "GET",
    }, function (error, response, body) {
        //console.log(body);
        if (!error && response.statusCode == 200) {
            res.status(200).send(body);
        }else {
            res.status(404).send("Not Found");
        }
    })
});

router.get("/:id/remixes", function (req, res) {
    request({
        url: `https://api.scratch.mit.edu/projects/${req.params.id}/remixes?offset=${req.query.offset}&limit=${req.query.limit || 16}`,
        method: "GET",
    }, function (error, response, body) {
        //console.log(body);
        if (!error && response.statusCode == 200) {
            res.status(200).send(body);
        }else {
            res.status(404).send("Not Found");
        }
    })
});
module.exports = router;
