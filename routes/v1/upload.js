const uploadRouterV1 = require("express").Router();
const multer = require('multer');
const { nanoid } = require('nanoid');
const path = require('path');

// CONTROLLERS
// const auth = require('../../controllers/v1/authController');
const cors = require('../../controllers/v1/corsController');

//OPTIONS FOR CORS CHECK
uploadRouterV1.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

const storage = multer.diskStorage(
{
    destination: (req, file, cb) => 
    {   
        cb(null, path.join(__dirname, '../../public/images'));
    },
    filename: (req, file, cb) => 
    {      
        cb(null, (nanoid(4) + file.originalname ).split(' ').join('_'))
    }
});

const storage3d = multer.diskStorage(
{
    destination: (req, file, cb) => 
    {   
        cb(null, 'public/images/productsImgs');
    },
    filename: (req, file, cb) => 
    {      
        cb(null, (nanoid(4) + file.originalname ).split(' ').join('_'))
    }
});

const storageAny = multer.diskStorage(
{
    destination: (req, file, cb) => 
    {   
        if(file.mimetype.startsWith('image'))
        {
            cb(null, 'public/images');
        }
        else if(file.mimetype.startsWith('model/gltf-binary'))
        {
            cb(null, 'public/images/productsImgs');
        }
    },
    filename: (req, file, cb) => 
    {      
        if(file.mimetype.startsWith('image'))
        {
            cb(null, (nanoid(4) + file.originalname ).split(' ').join('_'));
        }
        else if(file.mimetype.startsWith('model/gltf-binary'))
        {
            cb(null, (file.originalname).split(' ').join('_'))
        }
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

const glbFileFilter = (req, file, cb) => 
{    
    if(file.mimetype.startsWith('model/gltf-binary')) 
    {
        cb(null, true);
    }
    else
    {
        return cb(new Error('You can upload only glb files!'), false);
    }
};

const anyFilter = (req, file, cb) => 
{
    if(file.mimetype.startsWith('model/gltf-binary') || file.mimetype.startsWith('image')) 
    {
        cb(null, true);
    }
    else
    {
        return cb(new Error('You can upload only glb and image files!'), false);
    }
}

const upload3d = multer(
    { 
        storage: storage3d, 
        fileFilter: glbFileFilter,
    });

const upload = multer(
    { 
        storage: storage, 
        fileFilter: imageFileFilter,
    });

const uploadHtml = multer(
    { 
        fileFilter: htmlFileFilter,
    });

const uploadAny = multer(
    {
        storage : storageAny,
        fileFilter : anyFilter
    });

uploadRouterV1.route('/')

module.exports = {uploadRouterV1, upload, uploadHtml, upload3d, uploadAny};

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

