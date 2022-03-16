const router = require("express").Router();
const Message = require('../../models/Message')

router.post("/", async(req, res, next) => 
{
  try
  {
    const newMessage = new Message(req.body);

    const savedMessage = await newMessage.save();

    res.status(201).send(savedMessage);

  }catch(err){next(err)}
})

router.get("/:conversationId", async(req, res, next) =>
{
  try
  {
    const message = await Message.find(
      {
        conversationId: req.params.conversationId
      })
  
    res.status(200).json(message);

  }catch(err){next(err)}
})
module.exports = router;

