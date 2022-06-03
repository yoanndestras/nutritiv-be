const router = require("express").Router(),
      path = require('path');

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const auth = require('../../controllers/v1/authController');
const {backupMongoDB} = require("../../utils/dbBackups") // CALL SOCKETIO

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })


router.post("/", cors.corsWithOptions, auth.verifyUser, auth.verifyAdmin, (req, res, next) => 
{
  try 
  {
    const DB_NAME = process.env.DB_NAME;
    const currentDay = new Date().toLocaleDateString('pt-PT').replace(/\//g,'-');

    const ARCHIVE_PATH = path.join(__dirname, '../../public/dbBackups', `${currentDay}_${DB_NAME}.gzip`);
    backupMongoDB(DB_NAME, ARCHIVE_PATH);
  
    res.status(200).json(
        {
          success: true,
          status: "Database backup correctly created"
        }
      );
  }catch (err){next(err)}
})

module.exports = router;