const mongoose = require("mongoose");
const { required } = require("zod/mini");


const orderSchema = new mongoose.Schema(
  {
   orderNumber: String,
    
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    items:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product",
                required:true
            },
            quantity:{
                type:Number,
                required:true,
                default:1
            },
            price:{
                type:Number,
                required:true
            }
        }
    ],
    

    shippingAddress: String,
    shippingCity: String,
    shippingState: String,
    shippingZip: String,

    totalAmount: Number,

    paymentMethod: String,

    orderNumber: String,

    paymentStatus: {
      type: String,
      default: "pending"
    },

    stripeSessionId: String,

    status: {
      type: String,
      default: "processing"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", orderSchema);