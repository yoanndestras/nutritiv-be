const { spawn } = require('child_process'); // DATABASE BACKUP
const fs = require('fs');
const path = require('path'); // ACCESS TO FOLDERS PATHS
const {MongoClient} = require('mongodb');

// CONTROLLERS
const fileUpload = require('../controllers/v1/fileUploadController');
const backup = require("./dbBackups") // CALL SOCKETIO

/* 
Basic mongo dump and restore commands, they contain more options you can have a look at man page for both of them.
1. mongodump --db=rbac_tutorial --archive=./rbac.gzip --gzip
2. mongorestore --db=rbac_tutorial --archive=./rbac.gzip --gzip
Using mongodump - without any args:
  will dump each and every db into a folder called "dump" in the directory from where it was executed.
Using mongorestore - without any args:
  will try to restore every database from "dump" folder in current directory, if "dump" folder does not exist then it will simply fail.
*/

// const DB_NAME = 'rbac_tutorial';
// const ARCHIVE_PATH = path.join(__dirname, 'public', `${DB_NAME}.gzip`);

// 1. Cron expression for every 5 seconds - */5 * * * * *
// 2. Cron expression for every night at 00:00 hours (0 0 * * * )
// Note: 2nd expression only contains 5 fields, since seconds is not necessary

// Scheduling the backup every 5 seconds (using node-cron)
// cron.schedule('*/5 * * * * *', () => backupMongoDB());

exports.verifyAuth = async(req, res, next) => 
{
  let dbName = req.body.dbOld;
  let dbPassword = req.body.dbPassword;
  let dbUser = req.body.dbUser;

  if(!dbName || !dbPassword || !dbUser)
    {
      let err = new Error('Missing credentials!');
      err.statusCode = 400;
      next(err);
    }
  else if(dbName !== process.env.DB_NAME ||
          dbPassword !== process.env.DB_PASSWORD ||
          dbUser !== process.env.DB_USER)
    {
      let err = new Error('Wrong credentials!');
      err.statusCode = 400;
      next(err);
    }
  next();
}

exports.storeOnAWS = async(ARCHIVE_PATH) =>
{
  try 
  {
    const filePath = ARCHIVE_PATH;
    const fileName = "dbBackups/" + path.basename(ARCHIVE_PATH);

    const fileType = path.extname(ARCHIVE_PATH);
    await fileUpload.uploadFile(filePath, fileName, fileType); // Upload dbBackups on s3
  
    fs.unlinkSync(ARCHIVE_PATH); // Delete dbBackups from static folder

  }catch(error){console.log(error);}
}

exports.restoreBackup = async(req, res, next) =>
{
  try
  {
    let fileKey = req.fileKey;

    let readStream = fileUpload.getFileStream(fileKey), overwrite;
    let writeStream = fs.createWriteStream(path.join(__dirname, '../public/', fileKey));
    readStream.pipe(writeStream);
    
    
    let DB_HOST = req.dbHost, DB_OLD = req.dbOld, DB_NEW = req.dbNew, DB_OVERWRITE = req.overwrite;
    let DB_USER = req.dbUser, DB_PASSWORD = req.dbPassword;
    let ARCHIVE_PATH = path.join(__dirname, '../public/', fileKey);
    
    DB_OVERWRITE === true ? overwrite = "--drop" : overwrite = "";
    
    const child = spawn('mongorestore', [
      `-h=${DB_HOST}`,
      `--ssl`,
      `-u=${DB_USER}`,
      `-p=${DB_PASSWORD}`,
      `--authenticationDatabase=admin`,
      `--gzip`,
      `--archive=${ARCHIVE_PATH}`,
      `--nsFrom=${DB_OLD}.*`,
      `--nsTo=${DB_NEW}.*`,
      `${overwrite}`,
    ]);

    child.stdout.on('data', (data) => 
    {
      console.log('stdout:\n', data);
    });

    child.stderr.on('data', (data) => 
    {
      console.log('stderr:\n', Buffer.from(data).toString());
    });
    
    child.on('error', (error) => 
    {
      console.log('error:\n', error);
    });

    child.on('exit', async(code, signal) =>
    {
      if (code) console.log('Process exit with code:', code);
      else if (signal) console.log('Process killed with signal:', signal);
      else 
      {
        await backup.storeOnAWS(ARCHIVE_PATH);
        console.log('Backup succesfully restored on stage ✅');
        next();
      }
    });
  }catch(err){next(err)}
}

exports.backupMongoDB = async(req, res, next) =>
{
  try
  {
    const DB_OLD = req.body.dbOld;
    const DB_NEW = req.body.dbNew;
    const DB_PASSWORD = req.body.dbPassword;
    const DB_USER = req.body.dbUser;
    const DB_OVERWRITE = req.body.overwrite;
    
    const date = new Date();
    const currentDay = new Date().toLocaleDateString('fr-FR').replace(/\//g,'-');
    const currentHour = date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds();
    const ARCHIVE_PATH = path.join(__dirname, '../public/dbBackups', `${currentDay}_${currentHour}_${DB_OLD}.gzip`);
    const fileKey = 'dbBackups/' + `${currentDay}_${currentHour}_${DB_OLD}.gzip`;

    const client = new MongoClient(process.env.MONGO_URL);
    
    const DB_HOST = await client 
        .connect()
        .then(async () => 
        {
            const db = client.db(DB_OLD);
            const result = await db.command( { isMaster: 1 } )
            const primary = result.primary
            return primary
        })
        .catch((err)=>
        {
            console.log(err);
        });
        
    const child = spawn('mongodump', [
      `-h=${DB_HOST}`,
      `--ssl`,
      `-d=${DB_OLD}`,
      `-u=${DB_USER}`,
      `-p=${DB_PASSWORD}`,
      `--authenticationDatabase=admin`,
      `--archive=${ARCHIVE_PATH}`,
      '--gzip',
    ]);
    
    // 
    child.stdout.on('data', (data) => 
    {
      console.log('stdout:\n', data);
    });

    child.stderr.on('data', (data) => 
    {
      console.log('stderr:\n', Buffer.from(data).toString());
    });

    child.on('error', (error) => 
    {
      console.log('error:\n', error);
    });

    child.on('exit', async(code, signal) =>
    {
      if (code) console.log('Process exit with code:', code);
      else if (signal) console.log('Process killed with signal:', signal);
      else 
      {        
        if((ARCHIVE_PATH.indexOf(path.join(__dirname, '../public/dbBackups')) !== 0))
        {
            let err = new Error(`File ${fileKey} does not exist`);
            err.statusCode = 400;
            next(err);
        }

        // deepcode ignore PT: <please specify a reason of ignoring this>
        await backup.storeOnAWS(ARCHIVE_PATH);
        console.log('Backup is successfull ✅');
        req.dbHost = DB_HOST;
        req.dbOld = DB_OLD;
        req.dbNew = DB_NEW;
        req.overwrite = DB_OVERWRITE;
        req.dbUser = DB_USER;
        req.dbPassword = DB_PASSWORD;
        req.fileKey = fileKey;
        next();
      }
    });
  }
  catch(err){next(err);}
}