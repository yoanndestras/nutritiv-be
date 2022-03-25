const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ChatSchema = new Schema
({
    // name:
    // {
    //     type: String,
    //     require: true
    // },
    // hosts:
    // {
    //      type: Array,
    //      required: true
    // },
    members: 
    {
        type: Array,
        required: true,
    },
    messages:
    {
        type: Array,
        required: true,
        
        sender:
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        text:
        {
            type: String,
            required: true
        },
        id:
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        createdAt:
        {
            type: mongoose.Schema.Types.Date,
            required: true
        }
        // replyTo:
        // {
        //     type: mongoose.Schema.Types.ObjectId,
        // }
    },
    version: 
    {
        type: Number,
        immutable: true,
        default: 1,
    },
},
{
    timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});

let Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;