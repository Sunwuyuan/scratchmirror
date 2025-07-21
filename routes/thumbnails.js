import { Router } from "express";
var router = Router();
import axios from "../utils/axios.js";
import { writeFile, access, constants } from "fs";
import { join } from "path";

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
function download(projectId, res) {
  const filepath = join(
    __dirname,
    "..",
    `/file/thumbnails/${projectId}.png`
  );

  axios.get(
      `https://uploads.scratch.mit.edu/projects/thumbnails/${projectId}.png`,
      {
        responseType: "arraybuffer",
      }
    )
    .catch(function (err) {
      console.error(`Error in axios.get for project ID ${projectId}:`, err);
      res.status(500).send({
        message: "An error occurred while downloading the thumbnail.",
        error: err.message || "Unknown error"
      });
      return;
    })
    .then(function (response) {
      if (response) {
        writeFile(filepath, response.data, function (err) {
          if (err) {
            console.error(`Error writing file for project ID ${projectId}:`, err);
            res.status(500).send({
              message: "An error occurred while saving the thumbnail.",
              error: err.message || "Unknown error"
            });
            return;
          }
          res.sendFile(filepath);
          return;
        });
      }
    });
}
router.get("/retry/:id", function (req, res) {
  download(req.params.id, res);
});
router.get("/:id", function (req, res) {
  const filepath = join(
    __dirname,
    "..",
    `/file/thumbnails/${req.params.id}.png`
  );
  access(filepath, constants.F_OK, (err) => {
    if (err) {
      console.error(`File does not exist for project ID ${req.params.id}, downloading:`, err);
      download(req.params.id, res);
    } else {
      res.sendFile(filepath);
      return;
    }
  });
});
export default router;
