const router = require("express").Router(),
      path = require('path');
      

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
const {backupMongoDB, restoreBackup} = require("../../utils/dbBackups") // CALL SOCKETIO

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })


router.post("/", cors.corsWithOptions, backupMongoDB, restoreBackup, async(req, res, next) => 
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