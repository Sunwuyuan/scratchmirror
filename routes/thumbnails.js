var express = require('express');
var router = express.Router();
const request = require("request");
const axios = require('axios');
const fs = require('fs');
const path = require('path');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});
function download(projectId,res) {
    const filepath = path.join(__dirname, '..', `/file/thumbnails/${projectId}.png`);

    axios.get(`https://uploads.scratch.mit.edu/projects/thumbnails/${projectId}.png`, {
        responseType: 'arraybuffer'
    }).catch(function (err) {
        //console.log(`Error in axios.get:`, err);
        res.status(500).send('Internal Server Error');
        return;

    })
        .then(function (response) {
            //console.log(response);
            //console.log(response.headers);
            if (response) {
                fs.writeFile(filepath, response.data, function (err) {

                    if (err) {
                        res.status(500).send('Internal Server Error');
                        return;

                        //console.log(err)
                    };
                    //console.log('保存成功');
                    res.sendFile(filepath);
                    return;
                })
            }
        });}
router.get("/retry/:id", function (req, res) {

    download(req.params.id,res)
});
router.get("/:id", function (req, res) {
    const filepath = path.join(__dirname, '..', `/file/thumbnails/${req.params.id}.png`);
    fs.access(filepath, fs.constants.F_OK, (err) => {
        //console.log('文件判断');
        if (err) {
            download(req.params.id,res)
        } else {
            res.sendFile(filepath);
            return;
        }
    });
});
module.exports = router;
