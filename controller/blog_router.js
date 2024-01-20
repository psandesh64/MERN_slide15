const router = require('express').Router()
const Blog = require('../models/blog_model')

router.get('/api/blogs', (request,response) => {
    Blog.find({})
    .then(results => response.json(results))
})

router.post('/api/blogs',(request,response) => {
    const blog = new Blog(request.body)
    blog.save()
    .then(result => {
        response.status(201).json(result)
    })
})

module.exports = router
