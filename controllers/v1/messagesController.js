const mongoose = require('mongoose');
const Message = require("../../models/Message");
const Conversation = require("../../models/Conversation");
const User = require("../../models/User");


exports.verifyConvExist = async(req, res, next) =>
{
  try 
  {
    const conversationId = req.params.conversationId
    const conversation = await Conversation.findOne({_id: conversationId})
  
    if(conversation)
    {
      next();
    }
    else
    {
      let err = new Error("No conversation found with _id " + conversationId);
      err.statusCode = 400;
      next(err);
    }

  }catch(err){next(err)}
}