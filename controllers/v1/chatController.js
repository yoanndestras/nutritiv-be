const Chat = require("../../models/Chat");
const User = require("../../models/User");
const ObjectId = require('mongoose').Types.ObjectId;

// exports.verifyAdminMembers = async(req, res, next) =>
// {
//   try
//   {
//     const membersId = req.body.members;
        
//     for(let i = 0; i < membersId.length; i++)
//     {
//       let user = await User.findById({_id: membersId[i]})
//       if(user && user.isAdmin === false)
//       {
//         let err = new Error(user.username + " is not admin!");
//         err.statusCode = 401;
//         next(err);
//       }
//     }
    
//     next();
//   }catch(err){next(err)}
  
// }

// exports.verifyMembersExist = async(req, res, next) =>
// {
//   try 
//   {
//     const membersId = req.body.members;
    
//     for(let i = 0; i < membersId.length; i++)
//     {
//       let user = await User.findById({_id: membersId[i]})
//       if(!user)
//         {   
//           let err = new Error(membersId[i] + " do not exist!");
//           err.statusCode = 400;
//           next(err);
//         }
//     }

//     next();
//   }catch(err){next(err)}
// }

// exports.verifySyntax = async(req, res, next) =>
// {
//   try
//   {
//     const membersId = req.body.members;
        
//     for(let i = 0; i < membersId.length; i++)
//     {
//       if(ObjectId.isValid(membersId[i]) === false)
//         {
//           let err = new Error(membersId[i] + " is not a valid ObjectId");
//           err.statusCode = 400;
//           next(err);
//         }
//     }
    
//     next();
//   }catch(err){next(err)}
// }

exports.verifyChatNotExist = async(req, res, next) =>
{
  try
  {
    const userId = req.user._id;
    const chats = await Chat.findOne({members: {$in: [userId]}},);
    if(chats && req.user.isAdmin === false)
    {
      let err = new Error("You are already part of a chat, chatId is : " + chats._id);
      err.statusCode = 400;
      next(err);
    }
    else
    {
      next();
    }
  }catch(err){next(err)}
}

exports.verifyChatExist = async(req, res, next) =>
{
  try 
  {
    const chatId = req.params.chatId;
    const sender = req.user._id;
    const chat = await Chat.findOne({_id: chatId, members: {$in: [sender]}})
  
    if(chat)
    {
      next();
    }
    else
    {
      let err = new Error("No chat found for user "+ req.user.username + " and chatId " + chatId);
      err.statusCode = 404;
      next(err);
    }
  
  }catch(err){next(err)}
}

exports.getChats = async(req, res, next) =>
{
  try
  {
    const userId = req.user._id;
    const chats = await Chat.find({members: {$in: [userId]}},).sort({updatedAt:-1});
    const messagesQty = parseInt(req.query.messagesQty);
    
    if(!messagesQty && chats && chats.length > 0)
    {
      let messagesArray = [];
      
      chats.map((chat) => 
      {
        const { type, version, createdAt, updatedAt, __v, messages, ...members} = chat._doc;
        messagesArray.push(members)
      });
      
      req.chats = messagesArray;
      next();
      // res.status(200).json(messagesArray);
    }
    else if(chats && chats.length > 0)
    {
      let messagesArray = [];
      
      chats.map((chat) => 
      {
        chat._doc.messages = chat._doc.messages.reverse();
        chat._doc.messages = chat._doc.messages.slice(0, messagesQty);
        chat._doc.messages = chat._doc.messages.reverse();
        const { type, version, createdAt, __v, updatedAt, ...message} = chat._doc;
        messagesArray.push(message)
      });

      req.chats = messagesArray;
      next();
      // res.status(200).json(messagesArray);
    }
    else
    {
      let err = new Error("No chat found for user " + req.user.username);
      err.statusCode = 200;
      next(err);
    }
  }catch(err){next(err)}
}

exports.getMessagesByChatId = async(req, res, next) =>
{
  try 
  {
    const chatId = req.params.chatId, userId = req.user._id;
    const chat = await Chat.find({_id : chatId, members: {$in: [userId]}});
    const queryStack = parseInt(req.query.stack), queryQuantity = parseInt(req.query.quantity);
    
    if((!queryStack || !queryQuantity) && (chat && chat.length > 0))
    {
      // res.status(200).json(chat.messages);
      req.chats = chat.messages;
      next();
    }
    else if(chat && chat.length > 0)
    {
      const start = (queryStack-1)*queryQuantity;
      const end = start + queryQuantity;
      
      let messages = chat[0].messages.reverse();
      messages = messages.slice(start, end).reverse();

      req.chats = messages;
      next();
      // res.status(200).json(messages);
    
    }
    else
    {
      let err = new Error("No chat found for chatId : " + chatId + " and username " + req.user.username);
      err.statusCode = 404;
      next(err);
    }
  }catch(err){next(err)}
}

exports.getSingleChatById = async(req, res, next) =>
{
  try
  {
    const chatId = req.params.chatId, userId = req.user._id;
    const chat = await Chat.findOne({_id : chatId, members: {$in: [userId]}});
    const messagesQty = parseInt(req.query.messagesQty);

    if(!messagesQty && chat)
    {
      const { type, version, __v, createdAt, updatedAt, messages, ...singleChat} = chat._doc;
      req.chat = singleChat;
      next();
      // res.status(200).json(singleChat);
    }
    else if(chat)
    {
      chat._doc.messages = chat._doc.messages.reverse();
      chat._doc.messages = chat._doc.messages.slice(0, messagesQty);
      chat._doc.messages = chat._doc.messages.reverse();
      const { type, version, createdAt, __v, updatedAt, ...singleChat} = chat._doc;
      
      req.chat = singleChat;
      next();
      // res.status(200).json(singleChat);
    }
    else
    {
      let err = new Error("No chat found for user " + req.user.username);
      err.statusCode = 404;
      next(err);
    }
  }catch(err){next(err)}
}

exports.createChat = async(req, res, next) =>
{
  try
  {
    const admins = await User.find({isAdmin: true});
    const username = req.user.username;
    
    let members = admins.map((admin) =>{return admin._id});
    if(members.some(member => member.toString() === req.user.id) === false)
    {
      members.push((req.user._id))
    }
    
    const newChat = new Chat({name: username, members})
    await newChat.save();
  
     // Chat
      //   .findOne({name: username})
      //   .populate('name').
      //   exec(function (err, chat) 
      //   {
      //     // if (err) return next(err);
      //   });
  
    req.chat = newChat;
    next()
  }catch(err){next(err)}
}

exports.createMessageByChatId = async(req, res, next) =>
{
  try 
  {
    const chatId = req.params.chatId;
    const sender = req.user._id;
    const text = req.body.text;
    
    const newMessage = await Chat.findOneAndUpdate(
      {_id: chatId, members: {$in: [sender]}},
      {
        $push :
        {
          messages : 
          {
            sender,
            text,
            id : new ObjectId(),
            createdAt: new Date()
          }
        }
      },
      {new: true});
    
    const savedMessage = await newMessage.save();
    let messages = [];
    await savedMessage.messages.map((message) => {if((message.sender.toString()) === sender.toString()){messages.push(message)}});
    let message = messages.reverse();
    let lastMessage = message[0];

    req.message = lastMessage;
    next();
  }catch(err){next(err)}
}
// exports.removeMessages = async(senderRooms, next) =>
// {
//   try
//   {
//     const rooms = senderRooms;
    
//     let senderRooms = [];

//     senderRooms.forEach(senderRoom => 
//       {
//           let senderRoomId = (senderRoom._id).toString();
        
//       });
    
//     const chats = await Chat.find({_id: {$in: [userId]}},);
//     if(chats && req.user.isAdmin === false)
//     {
//       let err = new Error("You are already part of a chat, chatId is : " + chats._id);
//       err.statusCode = 400;
//       next(err);
//     }
//     else
//     {
//       next();
//     }
//   }catch(err){next(err)}
// }