const { spawn } = require('child_process'); // DATABASE BACKUP
const fs = require('fs');
const path = require('path'); // ACCESS TO FOLDERS PATHS

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

exports.backupMongoDB = async(DB_NAME, ARCHIVE_PATH) =>
{
  try
  {
    const db_backups_folder = path.join(__dirname, '../db_backups');
  
    fs.readdir(db_backups_folder, (err, files) => 
    {
      files.some(file => 
        {
          let D1 = file.substring(0, 10);
          let D2 = new Date().toLocaleDateString('pt-PT').replace(/\//g,'-');
          let oldDate = new Date(D2).getTime() - (30 * 24 * 60 * 60 * 1000);
  
          if ((new Date(D1).getTime()) <= oldDate) 
          {
            fs.unlinkSync(path.join(__dirname, '../db_backups', file))
          } 
        });
    });
    
    const DB_HOST = process.env.DB_HOST;
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
      else console.log('Backup is successfull ✅');
    });
  }
  catch (error) 
  {
    console.log(error);
  }
}