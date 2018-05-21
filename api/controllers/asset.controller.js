var crudder = null;
var logger = null;
var fs = require("fs");
var IMAGEEXTENSIONS = ["webp", "bmp", "cur", "dds", "gif", "ico", "jpg", "png", "psd", "svg", "tiff", "webp"];
var _ = require("lodash");
var sharp = require("sharp");
var multer = require("multer");
var Mongoose = require("mongoose");
var upload1 = multer({ dest: __dirname + "/assets" });
let mCommonResponse = require('../helpers/response.definition').commonResponse

function init(_crudder, _logger) {
    crudder = _crudder;
    logger = _logger;
}

/**
 * For uploading the image 
 * @param {*} req 
 * @param {*} res 
 */
function upload(req, res) {
    var fileContent = req.swagger.params.file.value;
    if (fileContent) {
        var originalName = fileContent.originalname;
        var temp = fileContent.originalname.split(".");
        var extension = temp[temp.length - 1];
        var type = "IMAGE";
        var body = { docType: "IMAGE", originalName: originalName, extension: extension };
        if (validImageType(extension)) {
            var dir = type;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            dir += "/" + Math.floor(Math.random(2) * 10);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            var desPath = dir + "/" + originalName;

            var body = { docType: "IMAGE", originalName: originalName, path: desPath, extension: extension };
            saveImage(fileContent, desPath).then((image) => {
                crudder.create(body, function (err, doc) {
                    if (err) {
                        logger.error("Error Occured while creating the asset");
                        res.status(500).send({ "message": err.message });
                    } else {
                        res.status(200).send({
                            "status": getCommonResponse(200, "Image uploaded successfully"),
                            "responseBody": { id: doc._id }
                        });
                    }
                })
            }).catch(err => {
                logger.error("Error Occured while saving the Image");
                res.status(500).send({ "message": err.message });
            });

        } else {
            res.status(207).send({
                "status": getCommonResponse(207, "Image file type is Not suppourted")
            });
        }

    } else {
        console.log("The file is--");
        res.status(207).send({
            "status": getCommonResponse(207, "Please Upload Image")
        });
    }
}

/**
 * Downloading the Images
 * @param {*} req 
 * @param {*} res 
 */
function download(req, res) {
    var assetId = req.swagger.params.id.value;
    assetId = Mongoose.Types.ObjectId(assetId);
    crudder.findOne({ "_id": assetId }, function (err, doc) {
        if (err) {
            res.status(500).send({ message: err.message });
        } else if (_.isEmpty(doc)) {
            res.status(207).send(
                { "status": getCommonResponse(207, "Image Not Found") }
            );
        } else {
            var rstream = fs.createReadStream(doc.path);
            rstream.pipe(res, { end: false });
            rstream.on("end", () => {
                res.end();
            });
        }
    });

}

/**
 * This function will save the image into directory
 * @param {*} source 
 * @param {*} desPath 
 */
function saveImage(fileContent, desPath) {
    return new Promise((resolve, reject) => {
        fs.writeFile(desPath, fileContent.buffer, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * check whether the uploaded extension is valid or not
 * @param {*} extension 
 */
function validImageType(extension) {
    var extention = _.find(IMAGEEXTENSIONS, o => {
        return _.toLower(o) == _.toLower(extension);
    })
    if (extention) {
        return true;
    } else {
        return false;
    }
}

function getCommonResponse(code, message) {
    mCommonResponse.code = code;
    mCommonResponse.message = message;
    return mCommonResponse;
}


module.exports = {
    init: init,
    upload: upload,
    download: download
}