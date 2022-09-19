const router = require("express").Router(),
      path = require('path'),
      limitter = require('express-rate-limit');
      

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
const {backupMongoDB, restoreBackup, verifyAuth} = require("../../utils/dbBackups") // CALL SOCKETIO

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })


router.use( 
    limitter(
        {
            windowMs: 15 * 60 * 1000,
            max: 1,
            message: {
                code: 429,
                message: "Too many requests"
            }
        })
    ) // LIMIT SPAM REQUESTS TO MAX PER MILLISECONDS

router.post("/", cors.corsWithOptions, verifyAuth, backupMongoDB, restoreBackup, async(req, res, next) => 
{
  try 
  {
    res.status(200).json(
        {
          success: true,
          status: "Database backup correctly created"
        }
      );
  }catch (err){next(err)}
})

module.exports = router;