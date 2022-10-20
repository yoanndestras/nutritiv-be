# Nutritiv-be

*Read this in other languages : 
[English](README.md) 
![GB-flag.](/public/images/GB@2x.png "This is the GB flag.") 
[French](README.fr.md) 
![FR-flag.](/public/images/FR@2x.png "This is the french flag.")*
## Introduction

>This repository contains the back-end (be) of **Nutritiv** project.
Nutritiv is an **e-commerce** project for **food supplements** for the health of athletes.
Nutritiv is made to cast a wide net on basic functionality used on most websites and isn't intended to be in production.

>This website is made on **MERN** stack using **REST API**.
We choosed MERN technologies because it's very reusable and fast to use, morever we particulary appreciate to work on **Javascript**.
## Initialize the project

We use **npm**, the default package manager for Node.js Javascript runtime environment *(npm init -y)*.
## API
>To perform API calls on development and testing, we used **Postman**, click on link below to access to our API documentation.
 
 
 ## [**Postman API documentation**](https://documenter.getpostman.com/view/15856568/UVkpMv2U#78474388-f20b-460c-9300-705113cadee4) 
![postman logo.](/public/images/postman_logo.png "This is the postman logo.")


### Create a new API endpoint

1. Create a new route file
2. Add the route file the router based on url in app.js, *ex : authRoute = require("./routes/auth");*
3. Create the endpoint contents, *ex : router.post("/login"... async(req, res, next){content...});*
4. Use *try{...}.catch(err){...}* method in endpoint content
5. Add additionnal controller function to the endpoint to handle cors...

## Database

We use **MongoDB** with mongoose module, a schema based solution for our data.

### Connect to database

1. Create a cluster on MongoDB
2. Handle the Network and Database access to MongoDB
3. Get the connection string of the cluster
4. Connect to the database with mongoose using the connection string

## Middlewares

>We choosed middlewares following some criterias, usuability, maintainability, functionnality...
Thanks to middlewares, our application features handle differents scenario :

- CORS policy, including a whitelist *(cors).*
- Request spam *(express-rate-limit).*
- Cookies *(cookieParser).*
- SecretKeys *(dotenv).*
- Static files *(path, fs, multer, sharp, nanoid).*
- File storage on a web service *(aws-sdk).*
- BDD backup file recurrent storage and upload *(cron, aws-sdk, child_process, mongodump & mongorestore).*
- Registration, authentification... *(passport, passport-local, passport-jwt, jsonwebtoken).*
- TFA authentication *(speakeasy, qrcode).*
- Google, Facebook and Github authentication *(passport-facebook, passport-google-oauth20, passport-github2).*
- Mails *(sgMail, mailer, email_validator).*
- Payment *(stripe).*
- Backend-end API requests *(node-fetch).*
- Tests *(Jest, Supertest).*
- HTTP headers security *(helmet).*

To install a new middleware go in terminal :
```bash
npm i "newMiddleware"
```
## Run the app

>Its not possible to run the app without the .env file.
Our app file is app.js, running this command will start the back-end server :
```bash
npm run start-dev 
```

## Application deployment

> [**Back-end API**](https://api.nutritiv.app/) deployed with AWS EC2
- Connect via SSH to Amazon Linux 2 server with PuTTy
- Nginx config for proxy and HTTPS with Let's Encrypt SSL certificate
- DNS config to a subdomain

> [**Front-end app**](https://www.nutritiv.app/) deployed with AWS Amplify
- DNS config with AWS Route 53 
### Additionnal informations

Our team use Trello to organize tasks and manage the project.

___
- Back-end Developper : [Yoann Destras](https://github.com/yoanndestras)
  - [**Back-end Repository**](https://github.com/yoanndestras/nutritiv-be)
- Front-end Developper : [Hugo Bonpain](https://github.com/Monstarrrr)
  - [**Front-end Repository**](https://github.com/Monstarrrr/nutritiv-fe)


