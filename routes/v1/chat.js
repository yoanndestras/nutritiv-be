const router = require("express").Router();
const Chat = require('../../models/Chat')
const User = require('../../models/User')

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
const chat = require('../../controllers/v1/chatController');

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

router.get("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, chat.getChats,
async(req, res, next) =>
{
  try
  {
    res.status(200).json(req.chats);
  }catch(err) {next(err)}

})

router.get("/messages/:chatId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, chat.getMessagesByChatId,
async(req, res, next) =>
{
  try
  {
    res.status(200).json(req.chats);
  }catch(err){next(err)}
})

router.get("/single/:chatId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, chat.getSingleChatById,
async(req, res, next) =>
{
  try
  {
    res.status(200).json(req.chat);
  }catch(err){next(err)}
})

router.post("/create", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
chat.verifyChatNotExist, chat.createChat, async(req, res, next) => 
{
  try
  {
    res.status(201).json(req.chat);
  }catch(err){next(err)}
})

router.post("/message/:chatId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh,
chat.verifyChatExist, chat.createMessageByChatId, async(req, res, next) => 
{
  try
  {
    res.status(201).send(req.message);
  }catch(err){next(err)}
})


router.delete("/single/:chatId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
auth.verifyAdmin, chat.verifyChatExist, async(req, res, next) =>
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


router.delete("/messages/:chatId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
chat.verifyChatExist, async(req, res, next) =>
{
  try
  {
    const chatId = req.params.chatId;
    const chat = await Chat.findOneAndUpdate({_id: chatId},
    {
      $set:
      {
        "messages": []
      }
    },
    {
      new: true
    });
    await chat.save();
    
    
    res.status(200).json(
      {
        success : true, 
        message : "Messages from this chat deleted successfully",
        chat: chat
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