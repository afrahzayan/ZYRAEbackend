const mongoose=require("mongoose");
// const { required, number } = require("zod/mini");

const cartSchema=mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    items:[
        {
        product:{ 
            type:mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
    },

    price: {
        type: Number,
        required: true
    },
    quantity:{
        type:Number,
        default:1,
        required:true
    },


    }
]
},
{timestamps:true});

const  cartModel=mongoose.model("carts",cartSchema);

module.exports=cartModel;