const express = require('express')
const {
  check,
  validationResult
} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const redis = require('redis')
const client = redis.createClient()
const router = express.Router()

const User = require('../model/User')
const auth = require('../middleware/auth')
const checkToken = require('../middleware/checkToken')

// sign up route 
router.post(
  '/Signup',
  [
    check('username', 'Please enter a Valid Username').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter a valid password').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      })
    }

    const {
      username,
      email,
      password
    } = req.body

    try {
      let user = await User.findOne({
        email,
      })
      if (user) {
        return res.status(400).json({
          msg: 'User Already Exists',
        })
      }

      user = new User({
        username,
        email,
        password,
      })

      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)

      await user.save()

      const payload = {
        user: {
          id: user.id,
        },
      }
      // generate token 
      jwt.sign(
        payload,
        'randomString', {
          expiresIn: 10000,
        },
        (err, token) => {
          if (err) throw err
          res.status(200).json({
            token,
          })
        }
      )
    } catch (error) {
      console.log(error)
      res.status(500).json({
        message: 'Server error',
      })
    }
  }
)

// log in route 
router.post(
  '/login',
  [
    check('email', 'please enter a valid email').isEmail(),
    check('password', 'Please enter a valid password').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      })
    }

    const {
      email,
      password
    } = req.body

    try {
      let user = await User.findOne({
        email,
      })
      if (!user) {
        return res.status(400).json({
          message: 'User not exist',
        })
      }

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({
          message: 'Incorrect password',
        })
      }

      const payload = {
        user: {
          id: user.id,
        },
      }

      jwt.sign(
        payload,
        'randomString', {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err
          // store in redis server as "control-list" of token
          client.set('token', token, (err, reply) => {
            res.status(200).json({
              token,
            })
          })
        }
      )
    } catch (error) {
      console.log(error)
      res.status(500).json({
        message: 'Server Error',
      })
    }
  }
)

// get user info (it could be any route related to user authorization)
router.get('/me', [checkToken, auth], async (err, req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    res.json(user)
  } catch (error) {
    console.log(error)
    res.json({
      message: 'Error in fetching user',
    })
  }
})

// log out 
// delete the token in token control-list (Redis server)
router.get('/logout', async (req, res) => {
  let storeToken = ''
  client.get('token', (err, reply) => {
    storeToken = reply
    if (!storeToken) {
      res.json({
        message: 'log out failed' + storeToken,
      })
    }
    client.del('token', (err, reply) => {
      if (err) {
        res.json({
          message: 'error:' + err,
        })
      }
      res.json({
        message: 'log out:' + reply,
      })
    })
  })
})

module.exports = router