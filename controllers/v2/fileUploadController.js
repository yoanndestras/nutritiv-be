const aws = require('aws-sdk');
const fs = require('fs');

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new aws.S3(
  {
    region,
    accessKeyId,
    secretAccessKey
  }
);

exports.deleteFile = (Key) =>
{
  let deleteParams = 
  {  
    Bucket: bucketName, 
    Key: Key
  };
  
  s3.deleteObject(deleteParams).promise()
}

exports.uploadFile = (filePath, fileName, fileType) => 
{
  const fileStream = fs.createReadStream(filePath)

  const uploadParams = 
  {
    Bucket: bucketName,
    Body: fileStream,
    ContentType: fileType,
    Key: fileName
  }
  
  return s3.upload(uploadParams).promise()
}

exports.getFileStream = (fileKey) =>
{
  const downloadParams = 
  {
    Key: fileKey,
    Bucket: bucketName
  }

  return s3.getObject(downloadParams).createReadStream()
}