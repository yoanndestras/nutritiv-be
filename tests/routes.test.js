const request = require('supertest');
// const mongoose = require("mongoose")
// const express = require("express");
// const router = express.Router();
// const routers = require("../routes");
const app = require("../app");

// for (const route in routers) 
// {
//     const myRoute = routers[route];
//     router.use(`/v1/${route}`, myRoute);
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

    test('should respond with a 400 status code', async () => 
    {
      const res = await request(app).post(`${auth}/register`)
        .send(
          {
            username: "helloWorld",
            email: "emailgmail.com",
            password : "Password1"
          })
      
          
      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('success', false)
      expect(res.headers['content-type']).toEqual(expect.stringContaining("json"))
      expect(res.body.success).toBeDefined()
    })
    
  
    
  
  })
})

