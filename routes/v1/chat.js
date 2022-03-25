const router = require("express").Router();
const Chat = require('../../models/Chat')
const User = require('../../models/User')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
const chat = require('../../controllers/v1/chatController');

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

router.get("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
async(req, res, next) =>
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
      
      res.status(200).json(messagesArray);
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
      
      res.status(200).json(messagesArray);
    }
    else
    {
      let err = new Error("No chat found for user " + req.user.username);
      err.statusCode = 404;
      next(err);
    }
    
  }catch(err) {next(err)}

})

router.get("/messages/:chatId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
async(req, res, next) =>
{
  try
  {
    const chatId = req.params.chatId, userId = req.user._id;
    const chat = await Chat.find({_id : chatId, members: {$in: [userId]}});
    const queryStack = parseInt(req.query.stack), queryQuantity = parseInt(req.query.quantity);
    
    if((!queryStack || !queryQuantity) && (chat && chat.length > 0))
    {
      res.status(200).json(chat.messages);
    }
    else if(chat && chat.length > 0)
    {
      const start = (queryStack-1)*queryQuantity;
      const end = start + queryQuantity;
      
      let messages = chat[0].messages.reverse();
      messages = messages.slice(start, end).reverse();
      res.status(200).json(messages);
    }
    else
    {
      let err = new Error("No chat found for chatId : " + chatId + " and username " + req.user.username);
      err.statusCode = 404;
      next(err);
    }
  
  }catch(err){next(err)}
})

router.get("/single/:chatId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
async(req, res, next) =>
{
  try
  {
    const chat = await Chat.findOne({_id : req.params.chatId});
    
    const { type, version, __v, createdAt, updatedAt, ...message} = chat._doc;
  
    res.status(200).json(message);
  
  }catch(err){next(err)}
})

router.post("/create", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
chat.verifyChatNotExist, async(req, res, next) => 
{
  try
  {
    const admins = await User.find({isAdmin: true});

    let members = admins.map((admin) =>{return admin._id});
    if(members.some(member => member.toString() === req.user.id) === false)
    {
      members.push((req.user._id))
    }
    
    const newChat = new Chat({members})
    const savedChat = await newChat.save();
    
    res.status(201).json(savedChat);
    
  }catch(err){next(err)}
})

router.post("/message/:chatId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh,
chat.verifyChatExist, async(req, res, next) => 
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
    res.status(201).send(lastMessage);
  
  }catch(err){next(err)}
})


router.delete("/single/:chatId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAdmin, async(req, res, next) =>
{
  try
  {
    const chatId = req.params.chatId;
  
    await Chat.findByIdAndDelete(chatId);
    
    res.status(200).json(
      {
        success : true, 
        message : "Chat deleted"
      });
  }catch(err) {next(err)}
  
})

// router.delete("/self", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
// async(req, res, next) =>
// {
//   try
//   {
//     const userId = req.user._id;
//     const chat = await Chat.findOne({members: {$in: [userId]}}); 

//     if(chat)
//     {
//       const chatId =chat._id;
      
//       await Chat.findByIdAndDelete(chatId);
      
//       res.status(200).json(
//         {
//           success : true, 
//           message : "Chat deleted"
//         });
//     }
//     else
//     {
//       let err = new Error("No chat found for user "+ req.user.username);
//       err.statusCode = 404;
//       next(err);
//     }
    
    
//   }catch(err) {next(err)}
  
// })

//DELETE RECENT CHATS
router.delete("/lastDay", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, 
async (req, res, next) =>
{
    const date = new Date();
    const lastDay = new Date(date.setUTCDate(date.getUTCDate() -1));
    try
    {
        let income = await Chat.deleteMany( { "createdAt" : {$gt : lastDay } })
        res.status(200).json(income);
    }catch(err){next(err)}

})

module.exports = router;