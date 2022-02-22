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

// RESIZE USER ICON
exports.resizeUserIcon = async(req, res, next) => 
{
    if (!req.files) return next();
    await Promise.all
    (
        req.files.map(async file => 
            {
            await sharp(file.path)
                .resize(200, 200)
                .toFile(
                    path.resolve(file.destination,'usersIcons', file.filename)
                )
                fs.unlinkSync(path.join(file.destination,'usersIcons', file.filename)) 
                console.log(path.join(file.destination,'usersIcons', file.filename));
            })
    );
    
    next();
};

exports.addUserIcon = async(req, res, next) =>
{
  let file = req.files[0];
  file = path.join(file.destination,'usersIcons', file.filename)
  let icon = await (file.replace(/\\/g, "/")).replace("public/", "");
  
  
  const user = await User.findOneAndUpdate({_id: req.user._id},
    {
      $set:
      {
        icon
      }
    });
  user.save();
  next();
}

exports.verifyAddress = async(req, res, next) => 
{
  const user = await User.findOne({_id: req.user._id});
  
  if(!req.body.addressDetails)
  {
    let missingElementErr =  new Error('No address details found!');
    missingElementErr.code = 404;
    next(missingElementErr);
  }
  let addressDetails = req.body.addressDetails;
  const {address, zip, city, country, phoneNumber} = addressDetails;
    
  let missingElementErr =  new Error('Missing or wrong address details!');
  missingElementErr.code = 404;

  let addressAlreadyExistErr = new Error('This Address already exists!');
  addressAlreadyExistErr.code = 404;
  
  let phoneValidation = validatePhoneNumber.validate(phoneNumber);

  address && zip && city && country && phoneValidation ? user.addressDetails.some((address) => 
  {
    if (address.zip === addressDetails.zip && address.address === addressDetails.address) 
    {
      return next(addressAlreadyExistErr); 
    } 
  }) : next(missingElementErr);
  
  req.address = addressDetails;
  next()
  
}