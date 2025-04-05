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
      res.status(404).send("Not Found");
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
      res.status(404).send("Not Found");
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
      res.status(404).send("Not Found");
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
      res.status(404).send("Not Found");
    } else {
      res.status(200).send(data);
    }
  });
});

export default router;
