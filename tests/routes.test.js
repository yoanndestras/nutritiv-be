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
  let accessToken;

  describe('POST requests', () => 
  {
    it('REGISTER success, response : 201 statusCode', async () => 
    {
      const res = await request(app).post(`${register}`).send(users.sampleUser);
      await testConfig.statusCode201(res), await testConfig.successTrue(res);
      expect(res.body).toHaveProperty('status', "Registration Successfull! Check your emails!");
      // end(() => {accessToken = res.body.data[1].id;});
    })
    
    it("REGISTER failed, response : 400 statusCode ", async () => 
    {
      const res = await request(app).post(`${register}`).send(users.sampleUser)
      await testConfig.status400AndSuccessFalse(res);
      expect(res.body).toHaveProperty('err', 'An account with your username already exists!')
    })
    
    it("REGISTER failed, response : 400 statusCode ", async () => 
    {
      const res = await request(app).post(`${register}`).send(users.emailErrorUser)
      await testConfig.status400AndSuccessFalse(res);
      expect(res.body).toHaveProperty('err', "Your Email syntax is wrong!")
    })

    it("REGISTER failed, response : 400 statusCode", async () => 
    {
      const res = await request(app).post(`${register}`).send(users.passwordErrorUser)
      await testConfig.status400AndSuccessFalse(res);
      expect(res.body).toHaveProperty('err', "Your password syntax is wrong!")
    })
    
    it("LOGIN unsuccessfull, response : 400 statusCode", async () => 
    {
      const user = {username : users.sampleUser.username, password : users.sampleUser.password}
      const res = await request(app).post(`${login}`).send(user);
      await testConfig.status400AndSuccessFalse(res);
      expect(res.body).toHaveProperty('err', "Your account is not verified!")
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

