import { Router } from "express";
var router = Router();
import request from "request";

var releases = {};
function fetchFromScratchAPI(url, callback) {
  request(
    {
      url,
      method: "GET",
      headers: {
        "User-Agent": "AutoScratchDesktopMirror",
      },
    },
    callback
  );
}

fetchFromScratchAPI(
  "https://api.github.com/repos/sunwuyuan/AutoScratchDesktopMirror/releases/latest",
  function (error, response, body) {
    if (error) {
      console.log(body);
      console.log(error);
      return;
    }
    releases = JSON.parse(response.body);
    console.log("success to get latest version");
  }
);

router.get("/", function (req, res) {
  res.json(releases);
});

export default router;