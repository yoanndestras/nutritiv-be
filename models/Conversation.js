const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ConversationSchema = new Schema
({
    members: 
    {
      type: Array,
    },
},
{
    timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});

let Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;