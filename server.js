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

apiRoutes.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the coolest API on earth!',
    status: 'OK'
  })
})

app.use('/api', apiRoutes)

app.listen(port)
console.log(`Magic happen at http://localhost:${port}`)
