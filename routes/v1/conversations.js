const router = require("express").Router();
const Conversation = require('../../models/Conversation')

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
const conv = require('../../controllers/v1/conversationsController');

router.get("/:userId", cors.corsWithOptions, async(req, res, next) =>
{
  try
  {
    
    const conversation = await Conversation.find(
      {
        members: 
        {
          $in: [req.params.userId]
        }
      })
    
    if(conversation)
    {
      res.status(200).json(conversation);
    }
    else
    {
      let err = new Error("No conversation found for user " + req.params.userId);
      err.statusCode = 400;
      next(err);
    }
    
  }catch(err) {next(err)}

})

router.post("/:receiverId", cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin,
conv.verifyReceiver, async(req, res, next) => 
{
  try
  {
    const senderId = req.user._id;
    const receiverId = req.receiverId
    
    const newConversation = new Conversation(
      {
        members: [senderId, receiverId]
      })

    const savedConversation = await newConversation.save();
    
    res.status(201).json(savedConversation);

  }catch(err) {next(err)}
  
})

router.delete("/:conversationId", async(req, res, next) =>
{
  const conversationId = req.params.conversationId;

  await Conversation.findByIdAndDelete(conversationId);

  res.status(200).json(
    {
      success : true, 
      message : "Conversation deleted"
    });
})

module.exports = router;