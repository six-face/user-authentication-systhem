const express = require('express')
const bodyParser = require('body-parser')
const user = require('./routes/user')
const InitiateMongoServer = require('./config/db')

// Initiate Mongo Server
InitiateMongoServer()

const app = express()

// PORT
const PORT = process.env.PORT || 4000

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.json({
    message: 'API Working'
  })
})

app.use('/user', user)

// error handler 
app.use((err, req, res, next) => {
  console.log('root error handler:' + err)
  res.status(500).send('Something broke!')
})

app.listen(PORT, (req, res) => {
  console.log(`Server Started at PORT ${PORT}`)
})