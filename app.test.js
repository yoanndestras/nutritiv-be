const mongoose = require("mongoose");

mongoose
    .connect(process.env.MONGO_URL)
    .then(async () => 
    {
      if(process.env.DB_NAME === "Nutritiv-testing")
      {
          const db = mongoose.connection.db;
          const collections = await db.listCollections().toArray();
          
          await Promise.all
          (
              collections
              .map(async (collection) =>  
              {
                  await db.dropCollection(collection.name)
              })
          )
      }
      else
      {
        console.log("You cannot perform this operation")
      }
    })
    .catch((err)=>
    {
        console.log(err);
    });
  
describe('Sample Test', () => {
  it('should test that true === true', () => {
    expect(true).toBe(true)
  })
})
