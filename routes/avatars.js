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
        console.error(`Error in axios.get for avatar ID ${projectId}:`, err);
        res.status(500).send({
            message: 'An error occurred while downloading the avatar.',
            error: err.message || 'Unknown error'
        });
        return;
    })
        .then(function (response) {
            if (response) {
                writeFile(filepath, response.data, function (err) {
                    if (err) {
                        console.error(`Error writing file for avatar ID ${projectId}:`, err);
                        res.status(500).send({
                            message: 'An error occurred while saving the avatar.',
                            error: err.message || 'Unknown error'
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

    download(req.params.id,res)
});
router.get("/:id", function (req, res) {
    const filepath = join(__dirname, '..', `/file/avatars/${req.params.id}.png`);
    access(filepath, constants.F_OK, (err) => {
        if (err) {
            console.error(`File does not exist for avatar ID ${req.params.id}, downloading:`, err);
            download(req.params.id, res);
        } else {
            res.sendFile(filepath);
            return;
        }
    });
});
export default router;
