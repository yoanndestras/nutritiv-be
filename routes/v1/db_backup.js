const router = require("express").Router();


//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })


router.post("/", (req, res, next) => 
{
  try 
  {
    
  }catch (err){next(err)}
})

module.exports = router;