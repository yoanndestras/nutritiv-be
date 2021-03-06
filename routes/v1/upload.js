const uploadRouterV1 = require("express").Router();
const multer = require('multer');
const { nanoid } = require('nanoid');

// CONTROLLERS
const auth = require('../../controllers/v1/authController');
const cors = require('../../controllers/v1/corsController');

//OPTIONS FOR CORS CHECK
uploadRouterV1.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

const storage = multer.diskStorage(
{
    destination: (req, file, cb) => 
    {   
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => 
    {      
        cb(null, (nanoid(4) + file.originalname ).split(' ').join('_'))
    }
});

const imageFileFilter = (req, file, cb) => 
{    
    
    if(file.mimetype.startsWith('image')) 
    {
        cb(null, true);
    }
    else
    {
        return cb(new Error('You can upload only image files!'), false);
    }
};

const htmlFileFilter = (req, file, cb) => 
{    
    
    if(file.mimetype.startsWith('text/html')) 
    {
        cb(null, true);
    }
    else
    {
        return cb(new Error('You can upload only html files!'), false);
    }
};

const upload = multer(
    { 
        storage: storage, 
        fileFilter: imageFileFilter,
    });

const uploadHtml = multer(
    { 
        fileFilter: htmlFileFilter,
    });

uploadRouterV1.route('/')

module.exports = {uploadRouterV1, upload, uploadHtml};

// .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// .get(cors.cors, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, (req, res) => 
// {
//     res.status(403).json(
//         {
//             status: 'GET operation not supported on /imageUpload', 
//         });
// })
// //imageFile is the name of the input button to upload image
// .post(cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, upload.single('imageFile'), (req, res) => 
// {
//     res.status(200).json(
//         {
//             file : req.file 
//         });
// })
// .put(cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, (req, res) => 
// {
//     res.status(403).json(
//         {
//             status: 'PUT operation not supported on /imageUpload', 
//         });
// })
// .delete(cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, (req, res) => 
// {
//     res.status(403).json(
//         {
//             status: 'DELETE operation not supported on /imageUpload', 
//         });
// });

