const testConfig = require('./testConfig');

// EXPECT MESSAGES
exports.statusCode200 =  async(res) => expect(res.statusCode).toBe(200);
exports.statusCode201 =  async(res) => expect(res.statusCode).toBe(201);
exports.statusCode400 =  async(res) => expect(res.statusCode).toBe(400);
exports.statusCode401 =  async(res) => expect(res.statusCode).toBe(401);
exports.statusCode500 =  async(res) => expect(res.statusCode).toBe(500);

exports.successDefined =  async(res) => expect(res.body.success).toBeDefined();
exports.jsonContent =  async(res) => expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));

exports.successDefinedAndJsonContent = async(res) => 
{
  testConfig.successDefined(res);
  testConfig.jsonContent(res);
}

exports.successTrue =  async(res) => 
{
  expect(res.body).toHaveProperty('success', true);
  testConfig.successDefinedAndJsonContent(res);
}
exports.successFalse =  async(res) => 
{
  expect(res.body).toHaveProperty('success', false);
  testConfig.successDefinedAndJsonContent(res);
}

// SAMPLE USERS

exports.users = 
{
  sampleUser : 
  {
    username: "noError",
    email: "noError@gmail.com",
    password : "Password1"
  },
  emailErrorUser : 
  {
    username: "emailError",
    email: "emailError.com",
    password : "Password1"
  },
  passwordErrorUser : 
  {
    username: "passwordError",
    email: "passwordError@gmail.com",
    password : "Password"
  }
}

// CUSTOM EXPECTS FUNCTIONS

exports.status400AndSuccessFalse =  async(res) =>
{
  await testConfig.statusCode400(res);
  await testConfig.successFalse(res);
}

exports.status200AndSuccessTrue =  async(res) =>
{
  await testConfig.statusCode200(res);
  await testConfig.successTrue(res);
}