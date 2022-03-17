const mongoose = require('mongoose');
const Message = require("../../models/Message");
const Conversation = require("../../models/Conversation");
const User = require("../../models/User");

exports.verifyReceiver = async(req, res, next) =>
{
  try 
  {
    const receiverId = req.params.receiverId;
    const receiver = await  User.findOne({_id: receiverId});
    
    if(receiver)
    {
      if(receiver.isAdmin === true)
      {
        req.receiverId = receiver;
        next();
      }
      else
      {
        let err = new Error("Receiver is not admin!");
        err.statusCode = 401;
        next(err);
      }
    }
    else
    {
      let err = new Error("Couldn't find receiver!");
      err.statusCode = 400;
      next(err);
    }

  }catch(err){next(err)}
}