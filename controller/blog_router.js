const router = require('express').Router()
const Blog = require('../models/blog_model')
const {tokenExtractor} = require('../utils/middleware')

router.get('/blogs', async (request, response) => {
    try {
        const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });

        // Fetch image data for each blog entry
        const blogsWithImages = await Promise.all(blogs.map(async (blog) => {
            if (blog.image) {
                const imageData = Buffer.from(blog.image, 'base64');
                const imageSrc = `data:image/jpg;base64,${imageData.toString('base64')}`;
                return { ...blog._doc, imageSrc };
            }
            return blog;
        }));

        response.json(blogsWithImages);
    } catch (error) {
        console.error('Error fetching blogs with images:', error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
})


const multer= require('multer')
const path = require('path')
// Set up multer storage for saving files locally
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/') // Specify the directory where you want to save the files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Use current timestamp as filename
    },
})

const upload = multer({ storage: storage });

router.post('/blogs', tokenExtractor, upload.single('image'), async(request,response,next) => {
    try {
        const postedBody = request.body;
        const user = request.user
        console.log(user)
        // Handle file upload
        const image = request.file

        // Check if an image was provided in the request
        const imageLocation = image ? `uploads/${image.filename}` : null

        const blog = new Blog({
            ...postedBody,
            user: user._id,
            image: imageLocation,  
        });

        const savedBlog = await blog.save();
        user.blogs = user.blogs.concat(savedBlog._id);
        await user.save();

        response.status(201).json(savedBlog);
    } catch (error) {
        next(error)
    }
})

router.delete('/blogs/:id',tokenExtractor,async (request,response,next) => {
    try{
        const blog = await Blog.findById(request.params.id)
        const toDelete = request.user._id.toString() === blog.user._id.toString()
        ? request.params.id : undefined
        console.log(blog,toDelete,request.user._id,blog.user._id)
        const deletedBlog = await Blog.findByIdAndDelete(toDelete)
        if (deletedBlog){
        return response.status(204).end()
        }
        return response.status(404).json({error: 'Blog id not found'})
    } catch (error) {
        next(error)
    }
})
router.put('/blogs/like/:id', tokenExtractor, async (request, response, next) => {
    try{
        const updated_id = request.params.id
        const userId = request.user._id 
        const blog = await Blog.findOne({_id: updated_id})
        console.log(blog)
        if (!blog) {
            return response.status(400).json({error: 'blog id not found'})
        }
        const userIndex = blog.likes.indexOf(userId)
        if (userIndex === -1) {
            // User has not liked the blog, add the user to the likes array
            blog.likes.push(userId);
        } else {
            // User has already liked the blog, remove the user from the likes array
            blog.likes.splice(userIndex, 1);
        }

        const updatedBlog = await blog.save();
        // const newBlog= await Blog.findByIdAndUpdate(updated_id,
        //     {$set: {
        //         likes:obj.likes+1}
        //     },
        //     {new: true})
        return response.status(200).json(updatedBlog)
    } catch (error) { next(error) }
})
module.exports = router
