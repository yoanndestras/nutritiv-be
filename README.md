# nutritiv-be
Back-end of Nutritiv project

- Technologies used :
   "@sendgrid/mail": "^7.6.0",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^10.0.0",
    "email-validator": "^2.0.4",
    "express": "^4.17.1",
    "express-rate-limit": "^6.0.2",
    "jsonwebtoken": "^8.5.1",
    "lodash": "^4.17.21",
    "mongoose": "^6.0.14",
    "mongoose-currency": "^0.2.0",
    "multer": "^1.4.4",
    "nodemailer": "^6.7.2",
    "nodemailer-sendgrid": "^1.0.3",
    "nodemon": "^2.0.15",
    "passport": "^0.5.0",
    "passport-jwt": "^4.0.0",
    "passport-local": "^1.0.0",
    "passport-local-mongoose": "^6.1.0",
    "serverless-http": "^2.7.0"

## Creating project

- npm init -y

- In package.json, add
    <!--"start":"nodemon app.js" -->

- Create .env file for SecretKeys

- Create models (Cart, Order, Product, User)
- Create routes (auth, cart, order, product, upload, user) 
- Create DELETE and GET(one user, all USER, USER stats)

## Work order notes

- Mongoose Schema models


### Front-end implementation

- req.body -> req.body.formData 
