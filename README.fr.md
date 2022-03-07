# Nutritiv-be

*Read this in other languages : 
[English](README.md) 
![GB-flag.](/public/images/GB@2x.png "This is the GB flag.") 
[French](README.fr.md) 
![FR-flag.](/public/images/FR@2x.png "This is the french flag.")*
## Introduction

>Ce dépôt github contient la partie back-end (be) du projet **Nutritiv**.
Nutritiv est un projet de site **e-commerce** de **compléments alimentaires** déstiné à la santé des sportifs.
Nutritiv a été conçu afin de 

>This repository contains the back-end (be) of **Nutritiv** project.
Nutritiv is an **e-commerce** project for **food supplements** for the health of athletes.
Nutritiv is made to cast a wide net on basic functionality used on most websites and isn't intended to be in production.

>This website is made on **MERN** stack using **REST API**.
We choosed MERN technologies because it's very reusable and fast to use, morever we particulary appreciate to work on Javascript.
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
- Request spam *(limitter).*
- Cookies *(cookieParser).*
- SecretKeys *(dotenv).*
- Static files *(path, fs, multer, sharp, nanoid).*
- Registration, authentification... *(passport, passport-local, passport-jwt, jsonwebtoken).*
- Mails *(sgMail, mailer, email_validator)*
- Payment *(stripe).*

To install a new middleware go in terminal : **npm i "mymiddleware"**

## Run the app

>Its not possible to run the app without the .env file.
Our app file is app.js, running the command **npm run start-dev** ("start": "env-cmd -e development nodemon app.js") will start the back-end server.

### Additionnal informations

Our team use Trello to organize tasks and manage the project.

___
- Back-end Developper : [Yoann Destras](https://github.com/yoanndestras)
- Front-end Developper : [Monstar](https://github.com/Monstarrrr)
  - [**Front-end Repository**](https://github.com/Monstarrrr/nutritiv-fe)


