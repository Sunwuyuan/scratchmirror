import { Router } from "express";
var router = Router();
import { fetchFromScratchAPI } from "../utils/scratchAPI.js";

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/featured", function (req, res) {
  fetchFromScratchAPI("proxy/featured", {}, function (error, data) {
    if (error) {
      console.error("Error fetching featured data:", error);
      res.status(500).send({
        message: "An error occurred while fetching featured data.",
        error: error.message || "Unknown error"
      });
    } else {
      res.status(200).send(data);
    }
  });
});

export default router;
