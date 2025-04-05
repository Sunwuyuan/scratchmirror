import { Router } from "express";
var router = Router();
import { fetchFromScratchAPI } from "../utils/scratchAPI.js";
import { cacheUser, cacheUsers, cacheProjects } from "../utils/cacheData.js";

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/:id", function (req, res) {
  fetchFromScratchAPI(`users/${req.params.id}/`, {}, function (error, data) {
    if (error) {
      res.status(404).send({ error: "User not found", details: error.message });
    } else {
      const userData = JSON.parse(data);
      cacheUser(userData).catch(console.error);
      res.status(200).send(data);
    }
  });
});

router.get("/:id/projects", function (req, res) {
  const { limit, offset } = req.query;
  fetchFromScratchAPI(`users/${req.params.id}/projects`, { limit: limit || 16, offset }, function (error, data) {
    if (error) {
      res.status(404).send({ error: "Projects not found", details: error.message });
    } else {
      const projectsData = JSON.parse(data);
      cacheProjects(projectsData).catch(console.error);
      res.status(200).send(data);
    }
  });
});

router.get("/:id/following", function (req, res) {
  const { limit, offset } = req.query;
  fetchFromScratchAPI(`users/${req.params.id}/following`, { limit: limit || 16, offset }, function (error, data) {
    if (error) {
      res.status(404).send({ error: "Following users not found", details: error.message });
    } else {
      const usersData = JSON.parse(data);
      cacheUsers(usersData).catch(console.error);
      res.status(200).send(data);
    }
  });
});

router.get("/:id/followers", function (req, res) {
  const { limit, offset } = req.query;
  fetchFromScratchAPI(`users/${req.params.id}/followers`, { limit: limit || 16, offset }, function (error, data) {
    if (error) {
      res.status(404).send({ error: "Followers not found", details: error.message });
    } else {
      const usersData = JSON.parse(data);
      cacheUsers(usersData).catch(console.error);
      res.status(200).send(data);
    }
  });
});

export default router;
