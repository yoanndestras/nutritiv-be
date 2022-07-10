const request = require('supertest');
const mongoose = require("mongoose")
// const express = require("express");
// const router = express.Router();
// const routers = require("../routes");
const app = require("../app");

// for (const route in routers) 
// {
//     const myRoute = routers[route];
//     router.use(`/v1/${route}`, myRoute);
// }

// if(process.env.DB_NAME === "Nutritiv-testing")
// {
//     const db = mongoose.connection.db;
//     const collections = await db.listCollections().toArray();
    
//     await Promise.all
//     (
//         collections
//         .map(async (collection) =>  await db.dropCollection(collection.name))
//     )
// }
describe('AUTHENTICATION REQUESTS', () => 
{
  const auth = "/v1/auth";

  describe('POST', () => 
  {
    test('should respond with a 201 status code', async () => 
    {
      const res = await request(app).post(`${auth}/register`)
        .send(
          {
            username: "helloWorld",
            email: "email@gmail.com",
            password : "Password1"
          })
      
      expect(res.statusCode).toBe(201)
      expect(res.body).toHaveProperty('success', true)
      expect(res.headers['content-type']).toEqual(expect.stringContaining("json"))
      expect(res.body.success).toBeDefined()
    })
  
    

  })
})

