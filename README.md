# nutritiv-be
Back-end of Nutritiv project

## Work order notes

- npm init -y
- In package.json, add  <!--"start":"nodemon app.js" --> for npm start the app
- .env file for SecretKeys (using dotenv).
- Mongoose Schema models (Cart, Order, Product, User) for MERN app.
- Routes (auth, cart, order, product, upload, user) and basic GET, PUT, POST, DELETE API call.

## API docs

- Routes explanation (user, auth, cart, order, product, upload)
- user = the person doing the request

# USER (/api/users)
- GET "/" : return 5 last users created | cors & verify user exist & connected & is Admin
- GET "/stats" : return the number of users created by month (total) with the number of the month (_id) | cors & verify user exist & connected & is Admin
- GET "/find/:id" : return USER info except password | cors & verify user exist & connected

- PUT "/reset_password" : modify password of user | verify user exist & connected & new password syntax
- PUT "/checkJWT" : return loggedIn and isAdmin boolean

- DELETE "/:id" : delete user | cors & verify user exist & connected & user id = USER id
# AUTH (/api/auth)

- GET "/verify-email" : return user.isVerified = true | verify email token validity
- GET "/new_register_email" : send a new email to verify the account | verify user email exist & user.isVerified = false
- GET "/forget_pwd" : send an email to change user password account | verify user email exist
- GET /verify_forget_pwd": verify email token validity for "/forget_pwd" email

- POST "/register" : create a new account | verify username or email requested(Indexes) do not exist, verify syntax of email & password regex(8 characters minimum, 1 Uppercase, 1 lowercase, 1 number), send an email to verify the account
- POST "/new_password" : change user password, reset login attempts | verify new password syntax & equality of both input
- POST "/login" : connect the user, generate accessToken & refreshToken and send in res header, set refreshToken cookie | cors & verify user is not connected

- DELETE "/logout" : disconnect the user by clearing the cookie | cors & verify user exist & is not connected 
# PRODUCT (/api/products)

- GET "/" : return all products | cors
- GET "/?new=true" : return only the last product created | cors
- GET "/?tags=endurance" : return only products with the appropriate tag | cors
- GET "/find/:id" : return the appropriate product

- POST "/" : create a new product, calculate the price | cors & verify title and shape(Compound Indexes) do not exist & verify user exist & connected & is Admin & upload images (upload.any('imageFile'))

- PUT "/:id" : modify appropriate product | cors & verify user exist & connected & is Admin

- DELETE "/:id" : delete appropriate product | cors & verify user exist & connected & is Admin

# CART (/api/carts)
- GET "/" : return all carts | cors & verify user exist & connected & is Admin
- GET "/find/:userId" : return the cart of the user | cors & verify user exist & connected & user.id = userId

- POST "/addToCart" : create a new cart or if carte exist modify the cart by adding a new product of by modifying a product quantity and total price | cors & verify user exist & connected

- PUT "/updateCart" : modify appropriate cart | cors & verify user exist & connected & user.id = :id (user.id = cart.userId)

- DELETE "/:id" : delete appropriate cart | cors & verify user exist & connected & user.id = :id (user.id = cart.userId)

# ORDER (/api/orders)

- GET "/" : return all orders | cors & verify user exist & connected & is Admin
- GET "/income" : return only orders 2 months old by month(_id) and total | cors & verify user exist & connected & is Admin
- GET "/find/:userId" : return the orders of the user | cors & verify user exist & connected & user.id = userId

- POST "/" : create new order | cors & verify user exist & connected

- PUT "/:id" : modify appropriate order | cors & verify user exist & connected & is Admin

- DELETE "/:id" : delete appropriate order | cors & verify user exist & connected & is Admin

# UPLOAD (/api/imageUpload)

- GET "/" : GET operation not supported on /imageUpload |**

- POST "/" : add imageFile in public/images |**

- PUT "/" : PUT operation not supported on /imageUpload |**

- DELETE "/" : DELETE operation not supported on /imageUpload |**

**cors & verify user exist & connected & is Admin
