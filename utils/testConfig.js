const testConfig = 
{
  success201 : "expect(res.statusCode).toBe(201)",
  success200 : "expect(res.statusCode).toBe(200)",
  failed400 : "expect(res.statusCode).toBe(400)",
  failed401 : "expect(res.statusCode).toBe(401)",
  failed500 : "expect(res.statusCode).toBe(500)",
  successTrue : "expect(res.body).toHaveProperty('success', true)",
  successFalse : "expect(res.body).toHaveProperty('success', false)",
  successDefined : "expect(res.body.success).toBeDefined()",
  jsonContent : "expect(res.headers['content-type']).toEqual(expect.stringContaining('json'))",
}

module.exports = testConfig;