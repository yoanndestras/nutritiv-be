const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const MessageSchema = new Schema
({
    conversationId: 
    {
      type: String,
    },
    sender:
    {
      type: String,
    },
    text:
    {
      type: String,
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

let Message = mongoose.model('Message', MessageSchema);

module.exports = Message;