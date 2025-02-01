var express = require("express");
var router = express.Router();
const { fetchFromScratchAPI } = require("../utils/scratchAPI");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/featured", function (req, res) {
  fetchFromScratchAPI("proxy/featured", {}, function (error, data) {
    if (error) {
      res.status(404).send("Not Found");
    } else {
      res.status(200).send(data);
    }
  });
});

module.exports = router;
