var express = require('express');
var router = express.Router();
const request = require("request");
const axios = require('axios');
const fs = require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get("/:id", function (req, res) {
  request({
      url: `https://api.scratch.mit.edu/users/${req.params.id}/`,
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

router.get("/:id/projects", function (req, res) {
  const {limit, offset} = req.query;
  request({
      url: `https://api.scratch.mit.edu/users/${req.params.id}/projects?offset=${offset}&limit=${limit || 16}`,
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
