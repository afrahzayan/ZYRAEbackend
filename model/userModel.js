const mongoose = require("mongoose")
const softDeleteMiddleware = require("../middleware/softDelete")
const userSchema = mongoose.Schema({
    fname: {
        type: String,
        required: true,
        minlength: 4,
        trim: true
    },

    lname: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },

    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String ,
        required: true,
        minlength: 6,
        select: false  
    },

      role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },


    blocked: {
        type: Boolean,
        default: false
    },

    isDeleted: {
    type: Boolean,
    default: false
},

deletedAt: {
    type: Date,
    default: null
}
}, 

{ timestamps: true }
    
)

userSchema.pre(/^find/, softDeleteMiddleware);


const userModel = mongoose.model("Users", userSchema)
module.exports=userModel