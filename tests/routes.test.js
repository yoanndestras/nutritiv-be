const request = require('supertest')
// const express = require("express");
// const router = express.Router();
// const routers = require("../routes");
const app = require("../app");

// for (const route in routers) 
// {
//     const myRoute = routers[route];
//     router.use(`/v1/${route}`, myRoute);
// }


describe('Post /auth', () => {

  test('should respond with a 201 status code', async () => {
    const res = await request(app)
      .post('/v1/auth/register')
      .send({
        username: "helloWorld",
        email: "email@gmail.com",
        password : "Password1"
      })

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('success', true)
  })
})
