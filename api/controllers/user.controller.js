var crudder = null;
var logger = null;
var _ = require("lodash");
var Mongoose = require("mongoose");
var CryptoJS = require("crypto-js");
var SECRETKEY = "1234";
let mCommonResponse = require('../helpers/response.definition').commonResponse

function init(_crudder, _logger) {
    crudder = _crudder;
    logger = _logger;
}

/**
 * This function will create the user
 * @param {*} req 
 * @param {*} res 
 */
function create(req, res) {
    var data = req.swagger.params.data.value;
    if (!_.isEmpty(data)) {
        let condition = { "email": data.email };
        checkUserExists(condition, false).then(exists => {
            if (exists) {
                res.status(207).send({
                    "status": getCommonResponse(207, "User Already exists")
                });
            } else {
                data.password = CryptoJS.AES.encrypt(data.password, SECRETKEY);
                crudder.create(data, function (err, doc) {
                    if (err) {
                        logger.error("Error Occured while creating the user " + err.message);
                        res.status(500).send({ message: err.message });
                    } else {
                        logger.info("User created Successully");
                        res.status(200).send({
                            "status": getCommonResponse(200, "User created Successully"),
                            "responseBody": doc
                        });
                    }
                })
            }
        }).catch(err => {
            res.status(400).send({ "message": "Please Give Valid Data" });
        })

    } else {
        res.status(400).send({ "message": "Please Give Valid Data" });
    }
}

/**
 * This function will update the user info (its not patch it will do replace and update)
 * @param {*} req 
 * @param {*} res 
 */
function update(req, res) {
    var data = req.swagger.params.data.value;
    var id = req.swagger.params.id.value || "";
    id = Mongoose.Types.ObjectId(id);
    if (!_.isEmpty(data)) {
        crudder.findOneAndUpdate({ "_id": id }, { "$set": data }, { new: true, upsert: true }, function (err, doc) {
            if (err) {
                logger.error("Error Occured while updating the user " + err.message);
                res.status(500).send({ message: err.message });
            } else {
                logger.info("User Updated Successully");
                res.status(200).send({
                    "status": getCommonResponse(200, "User Updated Successully"),
                    "responseBody": doc
                });
            }
        });
    } else {
        res.status(400).send({ "message": "Please Give Valid Data" });
    }
}

/**
 * This function will check whether the user already exists for given Email Id or not
 * @param {*} condition 
 */
function checkUserExists(condition, docRequired) {
    return new Promise((resolve, reject) => {
        crudder.findOne(condition, function (err, doc) {
            if (err) {
                logger.error("Error Occured while getting the user Info" + err.message);
            } else if (_.isEmpty(doc)) {
                if (docRequired) {
                    resolve(doc);
                } else {
                    resolve(false);
                }
            } else {
                if (docRequired) {
                    resolve(doc);
                } else {
                    resolve(true);
                }

            }
        })
    })
}

/**
 * this function will activate the user
 * @param {*} req 
 * @param {*} res 
 */
function activate(req, res) {
    logger.info("Inside user activating function");
    var id = req.swagger.params.id.value || "";
    if (_.isEmpty(id)) {
        res.status(207).send({
            "status": getCommonResponse(207, "Send Proper user Id")
        });
    } else {
        id = Mongoose.Types.ObjectId(id);
        let condition = { "_id": id }, setObject = { "status": "ACTIVE" };
        updateUser(condition, setObject).then(() => {
            res.status(200).send({
                "status": getCommonResponse(200, "User Activated Successfully")
            });
        }).catch(err => {
            res.status(500).send({ message: "Error Occured While activating the User " + err.message });
        });
    }
}

/**
 * this function will deactivate the user
 * @param {*} req 
 * @param {*} res 
 */
function deActivate(req, res) {
    // logger.info("Inside user Deactivating function");
    console.log("inside deactivation");
    var id = req.swagger.params.id.value || "";
    if (_.isEmpty(id)) {
        res.status(207).send({
            "status": getCommonResponse(207, "Send Proper user Id")
            });
    } else {
        id = Mongoose.Types.ObjectId(id);
        console.log("id", id);
        let condition = { "_id": id }, setObject = { "status": "INACTIVE" };
        updateUser(condition, setObject).then(() => {
            console.log("------------------", "updaed---------");
            res.status(200).send({
                "status": getCommonResponse(200, "User Deactivated Successfully")
            });
        }).catch(err => {
            res.status(500).send({ message: "Error Occured While activating the User " + err.message });
        });
    }
}

/**
 * Update user docmunet
 * @param {*} condition 
 * @param {*} setObject 
 */
function updateUser(condition, setObject) {
    console.log("====", condition, setObject);
    return new Promise((resolve, reject) => {
        crudder.findOneAndUpdate(condition, { "$set": setObject }, { new: true, upsert: true }, function (err, doc) {
            if (err) {
                console.log(err);
                logger.error("Error Occured while updating the user " + err.message);
                reject(err);
                // res.status(400).send({ message: err.message });
            } else {
                logger.info("User Updated Successully");
                console.log("updated successfully");
                resolve(doc);
            }
        });
    });
}

function getCommonResponse(code, message) {
    mCommonResponse.code = code;
    mCommonResponse.message = message;
    return mCommonResponse;
}

module.exports = {
    init: init,
    create: create,
    update: update,
    activate: activate,
    deActivate: deActivate,
    checkUserExists: checkUserExists,
    SECRETKEY: SECRETKEY
}