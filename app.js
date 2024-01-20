const express = require('express')
const app = express()
const {MONGO_URL, PORT} = require('./utils/config')
const {info, error} = require('./utils/logger')
const {requestLogger, errorHandler, unknownEndpoint} = require('./utils/middleware')
const mongoose = require('mongoose')
const blog_router = require('./controller/blog_router')

mongoose.connect(MONGO_URL)
.then(() => info('Connected to MongoDB'))
.catch((error) => error('error connecting to MongoDB: ', error.message))

app.use(express.json())
app.use(requestLogger)

app.use('/',blog_router)

app.use(errorHandler)
app.use(unknownEndpoint)
module.exports = app