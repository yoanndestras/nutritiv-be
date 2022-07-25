const request = require('supertest');
// const express = require("express");
// const router = express.Router();
// const routers = require("../routes");

// for (const route in routers) 
// {
//     const myRoute = routers[route];
//     router.use(`/v1/${route}`, myRoute);
// }
const mongoose = require("mongoose");
const app = require("../app");
console.log(app.ObjectId());

initializeTestingDatabase = async() =>
{
  mongoose
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
  return await initializeTestingDatabase();
})

afterAll(async () => 
{
  await clearTestingDatabase();
  console.log(await app.ObjectId.isValid("erere"));
  await mongoose.connection.close();
});
  
describe('Authentication routes', () => 
{
  const auth = "/v1/auth";
  
  describe('POST requests', () => 
  {
    test('should create a user, response : 201 statusCode', async () => 
    {
      const res = await request(app).post(`${auth}/register`)
        .send(
          {
            username: "noError",
            email: "noError@gmail.com",
            password : "Password1"
          })
      
      // console.log(res.text);
      
      expect(res.statusCode).toBe(201)
      expect(res.body).toHaveProperty('success', true)
      expect(res.body).toHaveProperty('status', "Registration Successfull! Check your emails!")
      expect(res.headers['content-type']).toEqual(expect.stringContaining("json"))
      expect(res.body.success).toBeDefined()
    })
    
    test("shouldn't create a user, response : 400 statusCode ", async () => 
    {
      const res = await request(app).post(`${auth}/register`)
        .send(
          {
            username: "emailError",
            email: "emailError.com",
            password : "Password1"
          })
      
      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('success', false)
      expect(res.body).toHaveProperty('err', "Your Email syntax is wrong!")
      expect(res.headers['content-type']).toEqual(expect.stringContaining("json"))
      expect(res.body.success).toBeDefined()
    })

    test("shouldn't create a user, response : 400 statusCode", async () => 
    {
      const res = await request(app).post(`${auth}/register`)
        .send(
          {
            username: "passwordError",
            email: "passwordError@gmail.com",
            password : "Password"
          })
      
      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('success', false)
      expect(res.body).toHaveProperty('err', "Your password syntax is wrong!")
      expect(res.headers['content-type']).toEqual(expect.stringContaining("json"))
      expect(res.body.success).toBeDefined()
    })
  })
})

