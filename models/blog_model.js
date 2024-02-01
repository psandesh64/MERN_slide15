const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Users'
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    image:{
        type: String,   // or use Buffer for storing image data
    }
})
blogSchema.set('toJSON',{
    transform: (doc,ret) => {
        delete ret.__v
    }
})
const Blog = mongoose.model('Blog',blogSchema)
module.exports = Blog