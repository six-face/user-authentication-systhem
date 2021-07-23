const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')

// connect to MongoDB
mongoose.connect('mongodb://localhost/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
mongoose.set('useCreateIndex', true)
const db = mongoose.connection

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  // connected!
})

// use session for traking logins
app.use(
  session({
    secret: 'six face',
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb://localhost/myapp',
    }),
  })
)

// parsing incoming requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))

// serve static files from template
app.use(express.static(__dirname + '/templateLogReg'))

// include routes
const routes = require('./routes/router')
app.use('/', routes)

// catch 404 forward to error handler
app.use((req, res, next) => {
  let err = new Error('File not found')
  err.status = 404
  next(err)
})

// error handler
// define as the last app.use callback
app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send(err.message)
})

// listen on port 3000
app.listen(3000, () => {
  console.log('Express app listening on port 3000')
})