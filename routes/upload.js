const router = require("express").Router();
const multer = require('multer');

// MIDDLEWARES
const auth = require('../controllers/authenticate');
const cors = require('../controllers/cors');

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

const storage = multer.diskStorage(
{
    destination: (req, file, cb) => 
    {   
        cb(null, 'public/images');
    },
    
    filename: (req, file, cb) => 
    {      
        cb(null, file.originalname)
    }
});

const imageFileFilter = (req, file, cb) => 
{
    var LowerCase_filename = file.originalname.toLowerCase();
    
    if(!LowerCase_filename.match(/\.(jpg|jpeg|png|gif)$/)) 
    {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

router.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, (req, res, next) => 
{
    res.status(403).json(
        {
            status: 'GET operation not supported on /imageUpload', 
        });
})
//imageFile is the name of the input button to upload image
.post(cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, upload.single('imageFile'), (req, res) => 
{
    res.status(200).json(
        {
            file : req.file 
        });
})
.put(cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, (req, res, next) => 
{
    res.status(403).json(
        {
            status: 'PUT operation not supported on /imageUpload', 
        });
})
.delete(cors.corsWithOptions, auth.verifyUser, auth.verifyRefresh, auth.verifyAdmin, (req, res, next) => 
{
    res.status(403).json(
        {
            status: 'DELETE operation not supported on /imageUpload', 
        });
});

module.exports = router;