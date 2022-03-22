const router = require("express").Router();
const Chat = require('../../models/Chat')
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
    if(chats && messagesQty)
    {
      let messagesArray = [];
      
      chats.map((chat) => 
      {
        chat._doc.messages = chat._doc.messages.slice(0, messagesQty);
        
        const {members, type, version, createdAt, __v, ...message} = chat._doc;
        
        messagesArray.push(message)
      });
    
      res.status(200).json(messagesArray);
    }
    else
    {
      let err = new Error("No chat found for user " + req.params.userId);
      err.statusCode = 400;
      next(err);
    }
    
  }catch(err) {next(err)}

})

router.get("/:chatId/messages/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
async(req, res, next) =>
{
  try
  {
    const chatId = req.params.chatId;
    const chat = await Chat.findById({_id : chatId}).lean();
    const queryStack = parseInt(req.query.stack), queryQuantity = parseInt(req.query.quantity);
    const start = (queryStack-1)*queryQuantity;
    const end = start + queryQuantity;
    if(chat)
    {
      let messages = chat.messages.reverse();
      messages = messages.slice(start, end).reverse();
      res.status(200).json(messages);
    }
    else
    {
      let err = new Error("No chat found for chatId : " + chatId);
      err.statusCode = 400;
      next(err);
    }

  }catch(err){next(err)}
})

router.post("/create", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, chat.verifySyntax, 
chat.verifyMembersExist, chat.verifyAdminMembers, async(req, res, next) => 
{
  try
  {
    const membersId = req.body.members;
    let members = membersId.map((member) =>
      {
        return member = new ObjectId(member)
      })
    
    members.push((req.user._id))

    const newChat = new Chat(
      {
        members
      })
    
    const savedChat = await newChat.save();
    
    res.status(201).json(savedChat);

  }catch(err) {next(err)}
  
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
      {_id: chatId},
      {
        $push :
        {
          messages : 
          {
            sender,
            text,
            id : new ObjectId()
          }
        }
      });

    const savedMessage = await newMessage.save();

    res.status(201).send(savedMessage);

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