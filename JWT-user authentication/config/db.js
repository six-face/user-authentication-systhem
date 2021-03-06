// connecting MongoDB server
// you can use remote server on MongoDB website (there is a free one) or connect to your local MongoDB server 
// here i am using remote MongoDB server,you can change this URL to yours
// those who want to use local MongoDB server you can define your own localhost URL (easy to find online :) )
const mongoose = require('mongoose')
// here complete your mongoDB link info below
const MONGOURI = 'mongodb+srv://'

const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('Connected to DB !!')
  } catch (err) {
    console.log(err)
    throw (err)
  }
}

module.exports = InitiateMongoServer