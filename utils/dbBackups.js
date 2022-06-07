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
exports.backupMongoDB = async(DB_NAME, ARCHIVE_PATH) =>
{
  try
  {
    const client = new MongoClient(process.env.MONGO_URL);
    
    const primaryHost = await client 
        .connect()
        .then(async () => 
        {
            const db = client.db(process.env.DB_NAME);
            const result = await db.command( { isMaster: 1 } )
            const primary = result.primary
            return primary
        })
        .catch((err)=>
        {
            console.log(err);
        });
    
    const DB_HOST = primaryHost;
    const DB_PASSWORD = process.env.DB_PASSWORD;
    const DB_USER = process.env.DB_USER;
    
    const child = spawn('mongodump', [
      `-h=${DB_HOST}`,
      `--ssl`,
      `-d=${DB_NAME}`,
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

    child.on('exit', (code, signal) =>
    {
      if (code) console.log('Process exit with code:', code);
      else if (signal) console.log('Process killed with signal:', signal);
      else 
      {
        backup.storeOnAWS(ARCHIVE_PATH);
        console.log('Backup is successfull ✅');
      }
    });
  }
  catch(error) {console.log(error);}
}