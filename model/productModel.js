const mongoose = require("mongoose");
const softDeleteMiddleware = require("../middleware/softDelete");

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    image: {
        type: String,
        required: true
    },

    description: {
        type: String,
        default: ""
    },

    collection: {
        type: String,
        default: ""
    },

    stock: {
        type: Number,
        default: 0
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true,
});

productSchema.pre(/^find/, softDeleteMiddleware);

module.exports = mongoose.model("Product", productSchema);