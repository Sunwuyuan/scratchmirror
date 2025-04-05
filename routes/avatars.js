import { Router } from 'express';
var router = Router();
import request from "request";
import axios from 'axios';
import { writeFile, access, constants } from 'fs';
import { join } from 'path';

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});
function download(projectId,res) {
    const filepath = join(__dirname, '..', `/file/avatars/${projectId}.png`);

    axios.get(`https://uploads.scratch.mit.edu/users/avatars/${projectId}.png`, {
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
                writeFile(filepath, response.data, function (err) {

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
    const filepath = join(__dirname, '..', `/file/avatars/${req.params.id}.png`);
    access(filepath, constants.F_OK, (err) => {
        //console.log('文件判断');
        if (err) {
            download(req.params.id,res)
        } else {
            res.sendFile(filepath);
            return;
        }
    });
});
export default router;
