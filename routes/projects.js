import { Router } from "express";
var router = Router();
import { fetchFromScratchAPI, fetchFromProjectAPI } from "../utils/scratchAPI.js";
import { cacheProject } from "../utils/cacheData.js";

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/explore/projects", function (req, res) {
  const { limit, language, mode, q, offset } = req.query;
  fetchFromScratchAPI("explore/projects", { limit: limit || 16, language: language || "zh-cn", mode: mode || "popular", q: q || "*", offset: offset || 0 }, function (error, data) {
    if (error) {
      console.error("Error fetching explore projects:", error);
      res.status(500).send({
        message: "An error occurred while fetching explore projects.",
        error: error.message || "Unknown error"
      });
    } else {
      res.status(200).send(data);
    }
  });
});

router.get("/search/projects", function (req, res) {
  const { limit, language, mode, q, offset } = req.query;
  fetchFromScratchAPI("search/projects", { limit: limit || 16, language: language || "zh-cn", mode: mode || "popular", q: q || "*", offset: offset || 0 }, function (error, data) {
    if (error) {
      console.error("Error searching projects:", error);
      res.status(500).send({
        message: "An error occurred while searching projects.",
        error: error.message || "Unknown error"
      });
    } else {
      res.status(200).send(data);
    }
  });
});

router.get("/source/:id", function (req, res) {
  fetchFromProjectAPI(`${req.params.id}?token=${req.query.token}`, {}, function (error, data) {
    if (error) {
      console.error(`Error fetching project source for ID ${req.params.id}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching project source.",
        error: error.message || "Unknown error"
      });
    } else {
      res.status(200).send(data);
    }
  });
});

router.get("/:id", function (req, res) {
  fetchFromScratchAPI(`projects/${req.params.id}/`, {}, function (error, data) {
    if (error) {
      console.error(`Error fetching project for ID ${req.params.id}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching project.",
        error: error.message || "Unknown error"
      });
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
      console.error(`Error fetching remixes for project ID ${req.params.id}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching project remixes.",
        error: error.message || "Unknown error"
      });
    } else {
      res.status(200).send(data);
    }
  });
});

export default router;
