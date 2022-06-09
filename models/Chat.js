const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const ChatSchema =  new Schema
({
    name:
    {
        type: String,
        required: true
    },
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
            type: ObjectId,
            required: true
        },
        text:
        {
            type: String,
            required: true
        },
        id:
        {
            type: ObjectId,
            required: true
        },
        createdAt:
        {
            type: Schema.Types.Date,
            required: true
        }
        // replyTo:
        // {
        //     type: ObjectId,
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