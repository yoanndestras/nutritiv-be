const aws = require('aws-sdk');
const fs = require('fs');

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey
});


exports.uploadFile = (file) => 
{
  const fileStream = fs.createReadStream(file.path)
  
  const uploadParams = 
  {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename
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