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

router.delete('/api/blogs/:id',async (request,response,next) => {
    try{
        const deletedBlog = await Blog.findByIdAndDelete(request.params.id)
        if (deletedBlog){
        return response.status(204).end()
        }
        return response.status(404).json({error: 'Blog id not found'})
    } catch (error) {
        next(error)
    }
})

module.exports = router
