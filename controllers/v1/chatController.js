const Chat = require("../../models/Chat");
const User = require("../../models/User");
const ObjectId = require('mongoose').Types.ObjectId;

exports.verifyAdminMembers = async(req, res, next) =>
{
  try
  {
    const membersId = req.body.members;
        
    for(let i = 0; i < membersId.length; i++)
    {
      let user = await User.findById({_id: membersId[i]})
      if(user && user.isAdmin === false)
      {
        let err = new Error(user.username + " is not admin!");
        err.statusCode = 401;
        next(err);
      }
    }
    
    next();
  }catch(err){next(err)}
  
}
exports.verifyMembersExist = async(req, res, next) =>
{
  try 
  {
    const membersId = req.body.members;
    
    for(let i = 0; i < membersId.length; i++)
    {
      let user = await User.findById({_id: membersId[i]})
      if(!user)
        {   
          let err = new Error(membersId[i] + " do not exist!");
          err.statusCode = 400;
          next(err);
        }
    }

    next();
  }catch(err){next(err)}
}

exports.verifySyntax = async(req, res, next) =>
{
  try
  {
    const membersId = req.body.members;
        
    for(let i = 0; i < membersId.length; i++)
    {
      if(ObjectId.isValid(membersId[i]) === false)
        {
          let err = new Error(membersId[i] + " is not a valid ObjectId");
          err.statusCode = 400;
          next(err);
        }
    }
    
    next();
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