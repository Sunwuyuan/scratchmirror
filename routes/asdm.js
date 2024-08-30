var express = require("express");
var router = express.Router();

const request = require("request");
var releases = {};
request(
  {
    url: "https://api.github.com/repos/sunwuyuan/AutoScratchDesktopMirror/releases/latest",
    method: "GET",
    headers: {
      "User-Agent": "AutoScratchDesktopMirror",
    },
  },
  function (error, response, body) {
    //console.log(body);
    if (error) {
      console.log(body);
      console.log(error);
      return;
    }
    releases = JSON.parse(response.body);
    console.log("success to get latest version");
  }
);
router.get("/", function (req, res) {
  res.json(releases);
});

module.exports = router;