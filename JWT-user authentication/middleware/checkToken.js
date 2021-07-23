// Creating a token control list saved in Redis server
// Check it every time before every requrst
const redis = require('redis')
const client = redis.createClient();

client.on('error', function (error) {
  console.log(error)
})

module.exports = function (req, res, next) {
  try {
    client.get('token', (err, reply) => {
      if (err) {
        return res.status(401).json({
          message: 'check token failed:' + err
        })
      }
      if (!reply) {
        return res.status(401).json({
          message: 'Token has expired, please log in'
        })
      }
      next()
    })
  } catch (error) {
    next(error)
    res.status(500).json({
      message: 'Redis Server Error'
    })
  }
}