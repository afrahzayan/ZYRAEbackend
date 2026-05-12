const mongoose = require("mongoose");
const { boolean } = require("zod/mini");

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

    category: {
        type: String
    },

    description: {
        type: String
    },

    collection: {
        type: String
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

module.exports = mongoose.model("Product", productSchema);