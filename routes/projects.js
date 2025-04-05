var express = require("express");
var router = express.Router();
const { fetchFromScratchAPI, fetchFromProjectAPI } = require("../utils/scratchAPI");
const { cacheProject } = require("../utils/cacheData");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/explore/projects", function (req, res) {
  const { limit, language, mode, q, offset } = req.query;
  fetchFromScratchAPI("explore/projects", { limit: limit || 16, language: language || "zh-cn", mode: mode || "popular", q: q || "*", offset: offset || 0 }, function (error, data) {
    if (error) {
      res.status(404).send("Not Found");
    } else {
      res.status(200).send(data);
    }
  });
});

router.get("/search/projects", function (req, res) {
  const { limit, language, mode, q, offset } = req.query;
  fetchFromScratchAPI("search/projects", { limit: limit || 16, language: language || "zh-cn", mode: mode || "popular", q: q || "*", offset: offset || 0 }, function (error, data) {
    if (error) {
      res.status(404).send("Not Found");
    } else {
      res.status(200).send(data);
    }
  });
});

router.get("/source/:id", function (req, res) {
  fetchFromProjectAPI(`${req.params.id}?token=${req.query.token}`, {}, function (error, data) {
    if (error) {
      res.status(404).send("Not Found");
    } else {
      res.status(200).send(data);
    }
  });
});

router.get("/:id", function (req, res) {
  fetchFromScratchAPI(`projects/${req.params.id}/`, {}, function (error, data) {
    if (error) {
      res.status(404).send("Not Found");
    } else {
      const projectData = JSON.parse(data);
      cacheProject(projectData).catch(console.error);
      res.status(200).send(data);
    }
  });
});

router.get("/:id/remixes", function (req, res) {
  const { limit, offset } = req.query;
  fetchFromScratchAPI(`projects/${req.params.id}/remixes`, { limit: limit || 16, offset }, function (error, data) {
    if (error) {
      res.status(404).send("Not Found");
    } else {
      res.status(200).send(data);
    }
  });
});

module.exports = router;
