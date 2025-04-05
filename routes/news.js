import { Router } from "express";
var router = Router();
import { fetchFromScratchAPI } from "../utils/scratchAPI.js";

router.get("/", function (req, res) {
  fetchFromScratchAPI("news", {}, function (error, data) {
    if (error) {
      res.status(404).send("Not Found");
    } else {
      res.status(200).send(data);
    }
  });
});

export default router;
