const router = require("express").Router();
const Conversation = require('../../models/Conversation')


router.post("/", async(req, res, next) => 
{
  try
  {
    const newConversation = new Conversation(
      {
        members: [req.body.senderId, req.body.receiverId]
      })

    const savedConversation = await newConversation.save();

    res.status(201).json(savedConversation);

  }catch(err) {next(err)}
  
})

router.get("/:userId", async(req, res, next) =>
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

    res.status(200).json(conversation);
    
  }catch(err) {next(err)}

})

module.exports = router;