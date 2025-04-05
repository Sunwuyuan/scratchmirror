import { Router } from "express";
var router = Router();
import { fetchFromScratchAPI } from "../utils/scratchAPI.js";
import { cacheUsers, cacheProjects } from "../utils/cacheData.js";

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/:id/projects", function (req, res) {
  const { limit, offset } = req.query;
  fetchFromScratchAPI(`studios/${req.params.id}/projects`, { limit: limit || 16, offset }, function (error, data) {
    if (error) {
      console.error(`Error fetching projects for studio ${req.params.id}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching projects for the studio.",
        error: error.message || "Unknown error"
      });
    } else {
      const projectsData = JSON.parse(data);
      cacheProjects(projectsData).catch(console.error);
      res.status(200).send(data);
    }
  });
});

router.get("/:id/managers", function (req, res) {
  const { limit, offset } = req.query;
  fetchFromScratchAPI(`studios/${req.params.id}/managers`, { limit: limit || 16, offset }, function (error, data) {
    if (error) {
      console.error(`Error fetching managers for studio ${req.params.id}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching managers for the studio.",
        error: error.message || "Unknown error"
      });
    } else {
      const usersData = JSON.parse(data);
      cacheUsers(usersData).catch(console.error);
      res.status(200).send(data);
    }
  });
});

router.get("/:id/curators", function (req, res) {
  const { limit, offset } = req.query;
  fetchFromScratchAPI(`studios/${req.params.id}/curators`, { limit: limit || 16, offset }, function (error, data) {
    if (error) {
      console.error(`Error fetching curators for studio ${req.params.id}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching curators for the studio.",
        error: error.message || "Unknown error"
      });
    } else {
      const usersData = JSON.parse(data);
      cacheUsers(usersData).catch(console.error);
      res.status(200).send(data);
    }
  });
});

router.get("/:id", function (req, res) {
  fetchFromScratchAPI(`studios/${req.params.id}`, {}, function (error, data) {
    if (error) {
      console.error(`Error fetching studio ${req.params.id}:`, error);
      res.status(500).send({
        message: "An error occurred while fetching the studio.",
        error: error.message || "Unknown error"
      });
    } else {
      res.status(200).send(data);
    }
  });
});

export default router;
