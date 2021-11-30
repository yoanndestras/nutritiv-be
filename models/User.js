const mongoose = require("mongoose")
const Schema = mongoose.Schema;


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
        type: String,
        required: true,
    },
    isAdmin: 
    {
        type: Boolean,
        default: false,
        required: true
    },
},
{
    timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});

let User = mongoose.model('User', UserSchema);

module.exports = User;