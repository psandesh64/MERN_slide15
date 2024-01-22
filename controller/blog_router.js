const router = require('express').Router()
const Blog = require('../models/blog_model')
const User = require('../models/user_model')
const jwt = require('jsonwebtoken')

router.get('/api/blogs', (request,response) => {
    Blog.find({}).populate('user',{username:1})
    .then(results => response.json(results))
})
const getTokenFrom = request => {
    const authorization = request.get("authorization")
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ','')
    }
    return null
}
router.post('/api/blogs',async(request,response,next) => {
    try {
        const postedBody = request.body;

        const token = getTokenFrom(request)

        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (!decodedToken.id) {
            return response.status(401).json({error : 'token invalid'})
        }

        const user = await User.findById(decodedToken.id)
        // const user = await User.findById(body.userId)
        //for branch 9
        if (!user) { return response.status(404).json({ error: 'User not found' }) }

        const blog = new Blog({
            ...postedBody,
            user: user._id,
        });

        const savedBlog = await blog.save();
        user.blogs = user.blogs.concat(savedBlog._id);
        await user.save();

        response.status(201).json(savedBlog);
    } catch (error) {
        next(error)
    }
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
router.put('/api/blogs/:id', async (request, response, next) => {
    try{
        const updated_id = request.params.id
        const obj = await Blog.findOne({_id: updated_id})
        console.log(obj)
        if (!obj) {
            return response.status(400).json({error: 'blog id not found'})
        }
        const newBlog= await Blog.findByIdAndUpdate(updated_id,
            {$set: {
                likes:obj.likes+1}
            },
            {new: true})
        return response.status(200).json(newBlog)
    } catch (error) { next(error) }
})

module.exports = router
