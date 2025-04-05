import { Router } from "express";
var router = Router();
import { fetchFromScratchAPI } from "../utils/scratchAPI.js";

router.get("/", function (req, res) {
  fetchFromScratchAPI("news", {}, function (error, data) {
    if (error) {
      console.error("Error fetching news:", error);
      res.status(500).send({
        message: "An error occurred while fetching news.",
        error: error.message || "Unknown error"
      });
    } else {
      res.status(200).send(data);
    }
  });
});

export default router;
