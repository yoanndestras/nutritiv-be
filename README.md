# nutritiv-be
Back-end of Nutritiv project

- Payment with Stripe

## Creating project

- npm init -y
- yarn add express mongoose dotenv nodemon
- In package.json, change this 
     <!-- "test": "echo \"Error: no test specified\" && exit 1"  -->
    to 
    <!--"start":"nodemon index.js" -->
- Update index.js file
- Create .env file to prevent SecretKey and Port
- Test Routes (Postman)
- Create models (Cart, Order, Product, User) and routes (auth, cart, order, product, user) 
- Register request
- yarn add crypto-js
- Login request
- yarn add jsonwebtoken
- add tokenAuth.js in routes file and update user.js
- create verifyTokenAndAdmin
- create DELETE and GET(one user, all USER, USER stats) request
- update product route to do create product request
- req.body -> req.body.formData to connect with reactjs form
## Work order notes

- Mongoose Schema models


### More

- node index.js
- db name : NutritivShop