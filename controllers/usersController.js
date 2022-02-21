const express = require('express');

const mongoose = require('mongoose');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const app = express();

app.use(express.json()); // to read JSON    
app.use(express.urlencoded({extended: true}));

// // RESIZE UserIcon
// exports.resizeUserIcon = async(req, res, next) => 
// {
//     if (!req.files) return next();
//     await Promise.all
//     (
//         req.files.map(async file => 
//             {
//             await sharp(file.path)
//                 .resize(200, 200)
//                 .toFile(
//                     path.resolve(file.destination,'productsImgs', file.filename)
//                 )
//                 fs.unlinkSync(file.path) 
//             })
//     );
    
//     next();

// };
