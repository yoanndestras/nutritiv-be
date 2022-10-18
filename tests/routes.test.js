const request = require('supertest');
const mongoose = require("mongoose");
const testConfig = require("../utils/testConfig");
const app = require("../app");
const users = testConfig.users;
const products = testConfig.products;
const User = require("../models/User");
const Product = require("../models/Product");


initializeTestingDatabase = async() =>
{
  await mongoose
    .connect(process.env.MONGO_URL)
    .then(async () => console.log("Connected to MongoDB"))
    .catch((err)=>{console.log(err)});
}

clearTestingDatabase = async() =>
{
  const   db = mongoose.connection.db,
          collections = await db.listCollections().toArray();
  
  await Promise.all
  (
    collections.map(async (collection) =>  
    {await db.dropCollection(collection.name)})
  )
}

beforeAll(async () => 
{
  jest.setTimeout(60000);
  return await initializeTestingDatabase();
})

afterAll(async () => 
{
  await clearTestingDatabase();
  app.http.close();
  await mongoose.connection.close();
});
  
let refreshToken, productId, productPrice;

describe('Authentication routes', () => 
{
  const auth = "/v1/auth"
  const register = auth + "/register";
  const login = auth + "/login";
  
  describe('POST requests', () => 
  {
    it('register a new user', async () => 
    {
      const res = await request(app).post(`${register}`).send(users.sampleUser);
      await testConfig.statusCode201(res), await testConfig.successTrue(res);
      expect(res.body).toHaveProperty('status', "Registration Successfull! Check your emails!");
      let user = await User.findOne({username: users.sampleUser.username})
      user.isVerified = true;
      user.isAdmin = true;
      await user.save();
    })
    
    it("return username exist ", async () => 
    {
      const res = await request(app).post(`${register}`).send(users.sampleUser)
      await testConfig.status400AndSuccessFalse(res);
      expect(res.body).toHaveProperty('err', 'An account with your username already exists!')
    })
    
    it("return error email", async () => 
    {
      const res = await request(app).post(`${register}`).send(users.emailErrorUser)
      await testConfig.status400AndSuccessFalse(res);
      expect(res.body).toHaveProperty('err', "Your Email syntax is wrong!")
    })
    
    it("return error password", async () => 
    {
      const res = await request(app).post(`${register}`).send(users.passwordErrorUser)
      await testConfig.status400AndSuccessFalse(res);
      expect(res.body).toHaveProperty('err', "Your password syntax is wrong!")
    })
    
    it("log in user", async () => 
    {
      const user = {username : users.sampleUser.username, password : users.sampleUser.password}
      const res = await request(app).post(`${login}`).send(user);
      await testConfig.successTrue(res);
      expect(res.body).toHaveProperty('loggedIn', true)
      expect(res.body).toHaveProperty('isAdmin', true)
      refreshToken = res.headers['refresh_token'];
    })
  })
})

describe("Users requests", () => 
{  
  const user = "/v1/users"
  const self = user + "/self";
  
  describe("GET routes", () => 
  {
    it("return user infos", async () =>
    {
      const res = await request(app).get(`${self}`).set({'refresh_token': refreshToken});
      expect(res.body).toHaveProperty('email', users.sampleUser.email)
      expect(res.body).toHaveProperty('username', users.sampleUser.username)
    })
  })
})

describe("Products routes", () => 
{
  const product = "/v1/products"

  describe("POST routes", () => 
  {
    it("create a new product", async() =>
    {
      const res = await request(app)
        .post(`${product}`)
        .field(products.sampleProduct)
        .set({'refresh_token': refreshToken})
        .attach('imageFile', `${__dirname}/test.jpg`)
        
        await testConfig.successTrue(res);
        
        let productArray = await Product.find();
        productId = productArray[0]._id; 
        productPrice = productArray[0].productItems[0].price.value;
    })
  })
})

describe("Carts routes", () => 
{
  const cart = "/v1/carts";
  const addToCart = cart + "/addToCart";
  const deleteCart = cart;

  describe("POST routes", () =>
  {
    it("create a new cart", async () =>
    {
      const res = await request(app)
      .post(`${addToCart}`)
      .send(
        {
          productId: productId,
          load: products.sampleProduct.load,
          price: productPrice,
          quantity: 1
        })
        .set({'refresh_token': refreshToken});
        await testConfig.successTrue(res);
    })
  })
  describe("DELETE routes", () =>
  {
    it("delete an existing cart", async () =>
    {
      let user = await User.findOne({username: users.sampleUser.username})
      let userId = user._id;
      
      const res = await request(app)
      .delete(`${deleteCart}/${userId}`)
      .set({'refresh_token': refreshToken});
      
      await testConfig.successTrue(res);
    })
  })
})

describe("Products routes", () => 
{
  const product = "/v1/products";

  describe("DELETE routes", () => 
  {
    
    it("Delete an existing product", async() =>
    {
      const deleteProduct = product + "/single/" + productId;
      
      const res = await request(app)
        .delete(`${deleteProduct}`)
        .set({'refresh_token': refreshToken})
        
        await testConfig.successTrue(res);
    })
  })
})

describe("random TESTS", () =>
{
  it("1 + 2 = 3", () =>
  {
    let one = 1;
    
    one = one + 2;
    
    expect(one).toBe(3);
    console.log(`one = `, one)
  })
})

