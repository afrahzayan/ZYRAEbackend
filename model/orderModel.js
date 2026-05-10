const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema(
  {
   orderNumber: String,
    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },

    userName: String,
    userEmail: String,
    userPhone: String,

    items: [
      {
        productId: String,
        name: String,
        price: Number,
        image: String,
        quantity: Number,
        size: String
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