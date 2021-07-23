const express = require('express')
const router = express.Router()
const User = require('../models/user')

// GET route for rending main page
router.get('/', (req, res, next) => {
  return res.sendFile(path.join(__dirname) + '/templateLogReg/index.html')
})

//POST route for updating data
router.post('/', (req, res, next) => {
  // confirm that user type same password twice
  if (req.body.password !== req.body.passwordConf) {
    let err = new Error('Password do not match')
    err.status = 400
    res.send('Password do not match')
    return next(err)
  }

  // registered user
  if (
    req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf
  ) {
    let userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    }

    User.create(userData, (err, user) => {
      if (err) {
        return next(err)
      } else {
        req.session.userId = user._id
        return res.redirect('/profile')
      }
    })

    // login user
  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, (err, user) => {
      if (err || !user) {
        let err = new Error('Wrong email or password')
        err.status = 401
        return next(err)
      } else {
        req.session.userId = user._id
        return res.redirect('/profile')
      }
    })
  } else {
    let err = new Error('all fields required')
    err.status = 400
    return next(err)
  }
})

// get user profle after registering / login
router.get('/profile', (req, res, next) => {
  User.findById(req.session.userId).exec((err, user) => {
    if (err) {
      return next(err)
    } else {
      if (user === null) {
        let err = new Error('Not authentized!')
        err.status = 400
        return next(err)
      } else {
        return res.send(
          `<h1>Name: </h1> ${user.username} <h2>${user.email}</h2> <br> <a type="button" href="/logout">Logout</a>`
        )
      }
    }
  })
})

// log out
router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err)
      } else {
        return res.redirect('/')
      }
    })
  }
})

module.exports = router
