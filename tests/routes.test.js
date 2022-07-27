// const express = require("express");
// const router = express.Router();
// const routers = require("../routes");

// for (const route in routers) 
// {
  //     const myRoute = routers[route];
  //     router.use(`/v1/${route}`, myRoute);
  // }

const request = require('supertest');
const mongoose = require("mongoose");
const testConfig = require("../utils/testConfig");
const app = require("../app");
const users = testConfig.users;

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
  return await initializeTestingDatabase();
})

afterAll(async () => 
{
  await clearTestingDatabase();
  app.http.close();
  await mongoose.connection.close();
});
  
describe('Authentication routes', () => 
{
  const auth = "/v1/auth"
  const register = auth + "/register";
  const login = auth + "/login";
  
  describe('POST requests', () => 
  {
    test('REGISTER success, response : 201 statusCode', async () => 
    {
      const res = await request(app).post(`${register}`).send(users.sampleUser);
      await testConfig.statusCode201(res), await testConfig.successTrue(res);
      expect(res.body).toHaveProperty('status', "Registration Successfull! Check your emails!")
    })
    
    test("REGISTER failed, response : 400 statusCode ", async () => 
    {
      const res = await request(app).post(`${register}`).send(users.sampleUser)
      await testConfig.status400AndSuccessFalse(res);
      expect(res.body).toHaveProperty('err', 'An account with your username already exists!')
    })
    
    test("REGISTER failed, response : 400 statusCode ", async () => 
    {
      const res = await request(app).post(`${register}`).send(users.emailErrorUser)
      await testConfig.status400AndSuccessFalse(res);
      expect(res.body).toHaveProperty('err', "Your Email syntax is wrong!")
    })

    test("REGISTER failed, response : 400 statusCode", async () => 
    {
      const res = await request(app).post(`${register}`).send(users.passwordErrorUser)
      await testConfig.status400AndSuccessFalse(res);
      expect(res.body).toHaveProperty('err', "Your password syntax is wrong!")
    })
    
    test("LOGIN unsuccessfull, response : 400 statusCode", async () => 
    {
      const user = {username : users.sampleUser.username, password : users.sampleUser.password}
      const res = await request(app).post(`${login}`).send(user);
      await testConfig.status400AndSuccessFalse(res);
      expect(res.body).toHaveProperty('err', "Your account is not verified!")
    })
  })
})

