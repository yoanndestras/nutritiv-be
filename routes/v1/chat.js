const router = require("express").Router();
const Chat = require('../../models/Chat')
const mongoose = require('mongoose');

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
const chat = require('../../controllers/v1/chatController');

router.get("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, 
async(req, res, next) =>
{
  try
  {
    const userId = req.user._id;
    const chat = await Chat.find(
      {
        members: 
        {
          $in: [userId]
        }
      })
    
    if(chat)
    {
      res.status(200).json(chat);
    }
    else
    {
      let err = new Error("No chat found for user " + req.params.userId);
      err.statusCode = 400;
      next(err);
    }
    
  }catch(err) {next(err)}

})

// router.get("/:chatId", async(req, res, next) =>
// {
//   try
//   {
//     const chatId = req.params.chatId;
//     const chat = await Chat.findById({chatId})
  
//     if(chat)
//     {
//       res.status(200).json(chat);
//     }
//     else
//     {
//       let err = new Error("No chat found for chatId : " + chatId);
//       err.statusCode = 400;
//       next(err);
//     }

//   }catch(err){next(err)}
// })

router.post("/", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, async(req, res, next) => 
{
  try
  {
    let members = req.body.members;
    members.push((req.user._id.toString()))
    
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
            text
          }
        }
      });

    const savedMessage = await newMessage.save();

    res.status(201).send(savedMessage);

  }catch(err){next(err)}
})


// router.delete("/:chatId", async(req, res, next) =>
// {
//   const chatId = req.params.chatId;

//   await Chat.findByIdAndDelete(chatId);

//   res.status(200).json(
//     {
//       success : true, 
//       message : "Chat deleted"
//     });
// })

module.exports = router;