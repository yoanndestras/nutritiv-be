const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new Schema
({
    username: 
    {
        type: String,
        required: true,
        unique: true
    },
    email: 
    {
        type: String,
        required: true,
        unique: true
    },
    password: 
    {
        type: String
    },
    isAdmin: 
    {
        type: Boolean,
        default: false,
        required: true
    }
},
{
    timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});

UserSchema.plugin(passportLocalMongoose);

let User = mongoose.model('User', UserSchema);
module.exports = User;