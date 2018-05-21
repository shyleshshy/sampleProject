var crudder = null;
var logger = null;
var _ = require("lodash");
var userCtrl = require("./user.controller.js");
var CryptoJS = require("crypto-js");
let mCommonResponse = require('../helpers/response.definition').commonResponse

function init(_crudder, _logger) {
    crudder = _crudder;
    logger = _logger;
}

/**
 * Performs validation and lets user to login 
 * @param {*} req 
 * @param {*} res 
 */
function validate(req, res) {
    logger.info("Inside Validate Function");
    var data = req.swagger.params.data.value || {};
    var email = data.email || "";
    var password = data.password || "";
    if (_.isEmpty(email) || _.isEmpty(password)) {
        res.status(207).send({
            "status": getCommonResponse(207, "Please Enter Email and Password")
        });
    } else {
        let condition = { "email": email };
        userCtrl.checkUserExists(condition, true).then(doc => {
            if (_.isEmpty(doc)) {
                res.status(207).send({
                    "status": getCommonResponse(207, "User not found")
                });
            } else if (doc.status == "INACTIVE") {
                res.status(207).send({
                    "status": getCommonResponse(207, "User not active")
                });
            } else {
                var bytes = CryptoJS.AES.decrypt(doc.password, userCtrl.SECRETKEY);
                var originalPassword = bytes.toString(CryptoJS.enc.Utf8);
                if (originalPassword == password) {
                    res.status(200).send({
                        "status": getCommonResponse(200, "User Logged in Successfully")
                    });
                } else {
                    res.status(207).send({
                        "status": getCommonResponse(207, "Password Mismatch!")
                    });
                }
            }
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
    }
}

function getCommonResponse(code, message) {
    mCommonResponse.code = code;
    mCommonResponse.message = message;
    return mCommonResponse;
}

module.exports = {
    init: init,
    validate: validate
}