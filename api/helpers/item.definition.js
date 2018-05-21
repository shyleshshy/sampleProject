
module.exports.definition={
    //Name of the item
    name:{
        type:String
    },
    //Name of the item_Code
    item_code:{
        type:String
    },
    //Price of the  item now we will keep 0 as the default Price
    price:{
        type:Number,
        default:0
    },
    //this will be containing the link of the image
    image:{
        type:String
    },
    //when we want to delete the object then we will make this flag as true
    deleted:{
        type:Boolean,
        default:false
    },
    //this field will gives the item created Date
    createdAt:{
        type:Date
    },
    //this field gives last updated time for the item
    lastUpdated:{
        type:Date
    }
}

