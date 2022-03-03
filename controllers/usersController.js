const express = require('express');
const User = require("../models/User");

const mongoose = require('mongoose');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const validatePhoneNumber = require('validate-phone-number-node-js');

const app = express();

app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));

// RESIZE USER AVATAR
exports.resizeUserAvatar = async(req, res, next) => 
{
  try
  {
    const user = await User.findOne({_id: req.user._id})
    if (!req.files) return next(err);
    await Promise.all
    (
        req.files.map(async file => 
            {
            await sharp(file.path)
                .resize(200, 200)
                .toFile(
                    path.resolve(file.destination,'usersAvatar', file.filename)
                )
                fs.unlinkSync(file.path) 
                if(user.avatar){fs.unlinkSync(path.join("public/", user.avatar))}
            })
    );
      next();
  }
  catch(err) {next(err);}
  
};

exports.addUserAvatar = async(req, res, next) =>
{
  try
  {
    let file = req.files[0];
    file = path.join(file.destination,'usersAvatar', file.filename)
    let avatar = await (file.replace(/\\/g, "/")).replace("public/", "");
    
    const user = await User.findOneAndUpdate({_id: req.user._id},
      {
        $set:
        {
          avatar
        }
      });
    user.save();
    next();
  }
  catch(err){next(err)}
  
}

exports.verifyAddress = async(req, res, next) => 
{
  const user = await User.findOne({_id: req.user._id});
  
  if(!req.body.addressDetails)
  {
    let missingElementErr =  new Error('No address details found!');
    missingElementErr.code = 400;
    next(missingElementErr);
  }
  let addressDetails = req.body.addressDetails;
  const {street, zip, city, country, phoneNumber} = addressDetails;
    
  let missingElementErr =  new Error('Missing or wrong address details!');
  missingElementErr.code = 400;

  let addressAlreadyExistErr = new Error('This Address already exists!');
  addressAlreadyExistErr.code = 400;
  
  let phoneValidation = validatePhoneNumber.validate(phoneNumber);

  street && zip && city && country && phoneValidation ? user.addressDetails.some((addressDetail) => 
  {
    if (addressDetail.zip === addressDetails.zip && addressDetail.street === addressDetails.street) 
    {
      return next(addressAlreadyExistErr); 
    } 
  }) : next(missingElementErr);
  
  req.address = addressDetails;
  next()
  
}