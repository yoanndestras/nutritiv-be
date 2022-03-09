const express = require('express');
const User = require("../models/User");

const mongoose = require('mongoose');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const validatePhoneNumber = require('validate-phone-number-node-js');

// CONTROLLERS
const fileUpload = require('../controllers/fileUploadController');

const app = express();

app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));

// RESIZE USER AVATAR
exports.resizeUserAvatar = async(req, res, next) => 
{
  try
  {
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    const user = await User.findOne({_id: req.user._id})
    if (!req.file)
    {
      let err = new Error('File not found!')
      next(err);
    }
    let avatar = user.avatar;
    avatar ? fileUpload.deleteFile(avatar) : null;
    
    let fileArray = [req.file];
    await Promise.all
    (
      fileArray.map(async file => 
            {
              await sharp(file.path)
                  .resize(200, 200)
                  .toFile(path.resolve(file.destination,'usersAvatar', file.filename))
            })
    );
    
    // if(avatar){fs.unlinkSync(path.join("public/images/usersAvatar/", avatar))}
    fs.unlinkSync(path.join("public/images/", req.file.filename))
    next();
  }catch(err) {next(err);}
  
};

exports.addUserAvatar = async(req, res, next) =>
{
  try
  {
    let file = req.file;
    file = path.join(file.destination,'usersAvatar', file.filename)

    const filePath = file;
    const fileName = req.file.filename
    
    const result = await fileUpload.uploadFile(filePath, fileName);
    let key = result.Key;

    fs.unlinkSync(path.join("public/images/usersAvatar", fileName))
        
    const user = await User.findOneAndUpdate({_id: req.user._id},
      {
        $set:
        {
          avatar: key
        }
      });
      
    
    await user.save();
    next();
  }catch(err){next(err)}
  
}

exports.verifyAddress = async(req, res, next) => 
{
  try
  {
    let addressDetails = req.body;
    const {street, zip, city, country, phoneNumber} = addressDetails;
    
    let missingElementErr =  new Error('Missing or wrong address details!');
    missingElementErr.code = 400;
    
    let phoneValidation = validatePhoneNumber.validate(phoneNumber);
    street && zip && city && country && phoneValidation === true ? next() : next(missingElementErr);
  
  }catch(err){next(err)}
  
}

exports.maxAmountOfAdresses = async(req, res, next) =>
{
  try
  {
    const user = await User.findOne({_id: req.user._id});
    const addressDetailsLength = user && user.addressDetails ? user.addressDetails.length : null;
  
    if(addressDetailsLength === 3)
    {
      let err = new Error('You already have the maximum amount of addresses registered on this account!');
      err.statusCode = 401;
      next(err);
    }
    else if(addressDetailsLength < 3)
    {
      next();
    }
  }catch(err){next(err)}
  
}

exports.verifyAdressId = async(req, res, next) =>
{
  try
  {
    
    const user = await User.findOne({_id: req.user._id});
    const addressId = req.params.addressId;
    const addressDetails = user && user.addressDetails && user.addressDetails.length > 0 ? user.addressDetails : null;
    const addressExist = addressDetails.some(address => address._id.toString() === addressId)
    
    if(addressExist) 
    {
      req.adressId = addressId;
      return next()
    }
    
    let err = new Error("Adress Id nor found in user's address list!");
    err.statusCode = 400;
    next(err)

  }catch(err){next(err)}
}

exports.updateAddress = async(req, res, next) =>
{
  try
  {
    const addressDetail = req.body;
    
    let modifyAdress = await User.findOneAndUpdate(
      {_id: req.user._id},
      {
        $set:
        {
          "addressDetails.$[inner]": addressDetail
        },
      },
      {
        arrayFilters: [
        {
            'inner._id': mongoose.Types.ObjectId(req.adressId)
        }
        ]
      },
    );
  
    await modifyAdress.save();
    next();

  }catch(err){next(err);}
}

exports.deleteAddress = async(req, res, next) =>
{
  try
  {
    let modifyAdress = await User.findOneAndUpdate(
      {_id: req.user._id},
      {
        $pull:
        {
          "addressDetails": {_id : mongoose.Types.ObjectId(req.adressId)}
        },
      },
    );
  
    await modifyAdress.save();
    next();
    
  }catch(err){next(err);}
}

exports.verifyUsername = (req, res, next) =>
{
    User.findOne({username: req.body.username}, (err, user) =>
        {
            if(user !== null)
            {
                let err = new Error('An account with your username already exists!');
                err.statusCode = 400;
                return next(err);
            }
            else
            {
                next();
            }
        })
};

exports.updateUsername = async(req, res, next) =>
{
  try
  {
    const username = req.body.username;  
    let updateUsername = await User.findOneAndUpdate(
      {_id: req.user._id},
      {
        $set: 
        {
          username: username
        }
      }
    )
    await updateUsername.save();
    next();
  
  }catch(err){next(err);}
}