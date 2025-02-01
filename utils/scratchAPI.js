const request = require("request");

function fetchFromScratchAPI(path, query, callback) {
  const baseUrl = "https://api.scratch.mit.edu/";
  const url = `${baseUrl}${path}?${new URLSearchParams(query).toString()}`;

  request({ url, method: "GET" }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, body);
    } else {
      callback(error || new Error("Not Found"));
    }
  });
}

module.exports = { fetchFromScratchAPI };
