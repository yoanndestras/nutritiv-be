const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema
({
    name: 
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
    isSeller: 
    {
        type: Boolean,
        default: false,
        required: true
    },
    seller: 
    {
        name: String,
        logo: String,
        description: String,
        rating:
        {
            type: Number,
            default: 0,
            required: true
        },
        numReviews:
        {
            type: Number,
            default: 0,
            required: true
        }
    },
},
{
    timestamps: true,
});

let User = mongoose.model('User', userSchema);

module.exports = User;
