var express = require("express");
var router = express.Router();
const { fetchFromScratchAPI } = require("../utils/scratchAPI");

router.get("/", function (req, res) {
  fetchFromScratchAPI("news", {}, function (error, data) {
    if (error) {
      res.status(404).send("Not Found");
    } else {
      res.status(200).send(data);
    }
  });
});

module.exports = router;
