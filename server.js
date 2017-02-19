const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const User = require('./app/models/user.js')

const port = process.env.PORT || 3000
mongoose.connect(process.env.MONGO_URL)
app.set('superSecret', process.env.SECRET)


app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.send(`Hello! The API is at http://localhost:${port}/api`)
})

app.get('/setup', (req, res) => {
  const admin = new User({
    name: 'riza',
    password: '220281',
    admin: true
  })
  admin.save((err) => {
    if (err)
      throw err
    console.log('User saved successfully')
    res.json({status: 'OK'})
  })
})

const apiRoutes = express.Router()

apiRoutes.post('/authenticate', (req, res) => {
  User.findOne({
    name: req.body.name
  }, (err, user) => {
    if (err) throw err

    debugger
    if (!user) {
      res.json({
        status: 'KO',
        message: 'Authentication failed. User not found.'
      })
    } else if (user) {
      if (user.password !== req.body.password) {
        res.json({
          status: 'KO',
          message: 'Authentication failed. Wrong password.'
        })
      } else {
        debugger
        const token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 60*60*24 // expires in 24 hours
        })

        res.json({
          status: 'OK',
          message: 'Enjoy your token!',
          token: token
        })
      }
    }
  })
})

apiRoutes.use((req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token']

  if (token) {
    jwt.verify(token, app.get('superSecret'), (err, decoded) => {
      if (err) {
        return res.json({
          status: 'OK',
          message: 'Failed to authenticate token.'
        })
      } else {
        req.decoded = decoded
        next()
      }
    })
  } else {
    return res.status(403).send({
      status: 'OK',
      message: 'No token provided.'
    })
  }
})

apiRoutes.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the coolest API on earth!',
    status: 'OK'
  })
})

apiRoutes.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    res.json(users)
  })
})

app.use('/api', apiRoutes)

app.listen(port)
console.log(`Magic happen at http://localhost:${port}`)
