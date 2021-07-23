const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
})

// authenticate input
UserSchema.statics.authenticate = (email, password, callback) => {
  User.findOne({
      email: email
    })
    .exec((err, user) => {
      if (err) {
        return callback(err)
      } else if (!user) {
        let err = new Error('User not found')
        err.status = 401
        return callback(err)
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (result === true) {
          return callback(null, user)
        } else {
          return callback()
        }
      })
    })
}

// hashing password
UserSchema.pre('save', function (next) {
  let user = this
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err)
    }
    user.password = hash
    next()
  })
})

let User = mongoose.model('User', UserSchema)
module.exports = User