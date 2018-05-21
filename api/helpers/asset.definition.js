
module.exports.definition={
    //Name of the original image
    name:{
        type:String
    },
    //the path where image will be stored
    path:{
        type:String
    },
    extension:{
        type:String
    },
    //based on the extension type this will be doc and image
    docType:{
        type:String,
        enum:["DOC","IMAGE","VIDEO"]
    }
}

