const express = require('express')
const app = express()
const {MONGO_URL, PORT} = require('./utils/config')
const {info, error} = require('./utils/logger')
const {requestLogger, errorHandler, unknownEndpoint} = require('./utils/middleware')
const mongoose = require('mongoose')

mongoose.connect(MONGO_URL)
.then(() => info('Connected to MongoDB'))
.catch((error) => error('error connecting to MongoDB: ', error.message))

app.use(express.json())
app.use(requestLogger)

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
})
const Blog = mongoose.model('Blog',blogSchema)

app.get('/api/blogs', (request,response) => {
    Blog.find({})
    .then(results => response.json(results))
})

app.post('/api/blogs',(request,response) => {
    const blog = new Blog(request.body)
    blog.save()
    .then(result => {
        response.status(201).json(result)
    })
})

app.use(errorHandler)
app.use(unknownEndpoint)
module.exports = app