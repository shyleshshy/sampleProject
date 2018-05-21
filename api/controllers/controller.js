"use strict";

var url = "mongodb://localhost:27017/Project";
var Mongoose = require("mongoose");
var log4js = require("log4js");
//Here i am configuring the levels and logging files for loggers.
log4js.configure({
    appenders: {
        fileAppender: { type: "file", filename: "logs.log" },
        items: { type: "file", filename: "items.log" },
        assets: { type: "file", filename: "asset.log" },
        user: { type: "file", filename: "user.log" },
    },
    categories: {
        default: { appenders: ["fileAppender","items","assets","user"], level: "info" },

    }
});

var assetLogger=log4js.getLogger("assets");
var itemLogger=log4js.getLogger("items");
var userLogger=log4js.getLogger("user");
var logger=log4js.getLogger("fileAppender");

/***********************************CONNECTION ESTABLISHMENT***************************************** */
Mongoose.connect(url, function (err) {
    if (!err) {
        console.log("connected-------------------------------");
        logger.info("Connected to the DB");
    } else {
        console.log("----------------err",err)
        logger.error("error " + err.message);
    }
});
/**************************************************************************************************** */



/****************************CONTROLLERS**************************************************** */
var assetCtrl=require("./asset.controller.js");
var itemCtrl=require("./item.controller.js");
var userCtrl=require("./user.controller.js");
var loginHandler=require("./loginHandler.js");
/*******************************************************************************************/

/**********************DEFINITIONS************************************************************************************************** */

var assetDefinition=require("../helpers/asset.definition.js");
var itemDefinition=require("../helpers/item.definition.js");
var userDefinition=require("../helpers/user.definition.js");

/*************************************VALIDATORS********************************************************************************************** */

var userValidator=require("../helpers/user.validator.js");

/*******************************CREATE MODELS******************************************************************************************** */

//asset model 
var assetSchema = new Mongoose.Schema(assetDefinition.definition);
var asset = Mongoose.model("asset", assetSchema);
//asset model instantiation
var itemSchema = new Mongoose.Schema(itemDefinition.definition);
var item = Mongoose.model("item", itemSchema);
//user model instantiation
var userSchema = new Mongoose.Schema(userDefinition.definition);
userSchema.index("email",{unique:true});
userSchema.path("email").validate(userValidator.validateEmail,"Email `{VALUE}` not valid", "Invalid Email Id");
var user = Mongoose.model("user", userSchema);

/***************************************************************************************************************************************** */

/**************************************CONTROLLER INSTANTIATIONS************************************************************************** */

assetCtrl.init(asset,assetLogger);
itemCtrl.init(item,itemLogger);
userCtrl.init(user,userLogger);
loginHandler.init(user,userLogger);

/***************************************************************************************************************************************** */


module.exports={
    v1_upload:assetCtrl.upload,
    v1_download:assetCtrl.download,
    v1_createUser:userCtrl.create,
    v1_updateUser:userCtrl.update,
    v1_activateUser:userCtrl.activate,
    v1_deActivateUser:userCtrl.deActivate,
    v1_login:loginHandler.validate,
    v1_itemCreate:itemCtrl.create,
    v1_itemUpdate:itemCtrl.update,
    v1_singleItem:itemCtrl.show,
    v1_itemDelete:itemCtrl.delete,
    v1_itemList:itemCtrl.index
}



