const Chat = require("../../models/Chat");
const User = require("../../models/User");

exports.verifyReceivers = async(req, res, next) =>
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

exports.verifyChatExist = async(req, res, next) =>
{
  try 
  {
    const chatId = req.params.chatId
    const chat = await Chat.findOne({_id: chatId})
  
    if(chat)
    {
      next();
    }
    else
    {
      let err = new Error("No chat found with _id " + chatId);
      err.statusCode = 400;
      next(err);
    }

  }catch(err){next(err)}
}