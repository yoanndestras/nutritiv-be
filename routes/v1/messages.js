const router = require("express").Router();
const Message = require('../../models/Message')

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
const mess = require('../../controllers/v1/messagesController');

router.post("/:conversationId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin,
mess.verifyConvExist, async(req, res, next) => 
{
  try
  {
    const conversationId = req.params.conversationId;
    const sender = req.user.userId;
    const text = req.body.text;

    const newMessage = new Message(
      {
        conversationId,
        sender,
        text
      });

    const savedMessage = await newMessage.save();

    res.status(201).send(savedMessage);

  }catch(err){next(err)}
})

router.get("/:conversationId", async(req, res, next) =>
{
  try
  {
    const conversationId = req.params.conversationId;

    const message = await Message.find({conversationId})
  
    if(message)
    {
      res.status(200).json(message);
    }
    else
    {
      let err = new Error("No message found for conversation " + conversationId);
      err.statusCode = 400;
      next(err);
    }

  }catch(err){next(err)}
})
module.exports = router;

