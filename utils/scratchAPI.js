import request from "request";

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

function fetchFromProjectAPI(path, query, callback) {
  const baseUrl = "https://projects.scratch.mit.edu/";
  const url = `${baseUrl}${path}?${new URLSearchParams(query).toString()}`;

  request({ url, method: "GET" }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, body);
    } else {
      callback(error || new Error("Not Found"));
    }
  });
}
export  { fetchFromScratchAPI, fetchFromProjectAPI };
