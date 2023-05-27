const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
const config = require('../utils.js/config')



blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body
    const decodedToken = jwt.verify(request.token, config.SECRET)

    if(!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }

    const user = request.user

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user.id
    })

    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    await user.save()
    response.status(201).json(result)
})

blogsRouter.delete('/:id', async(request, response) => {
    const decodedToken = jwt.verify(request.token, config.SECRET)

    if(!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }

    const user = request.user
    const blog = await Blog.findById(request.params.id)
    if (blog.user.toString() === user._id.toString()) {
        await Blog.deleteOne({ _id: request.params.id })
        response.status(204).end()
    } else {
        response.status(401).json({ error: 'unauthorized operation' })
    }
})

blogsRouter.put('/:id', async (request, response) => {
    const { title, author, url, likes } = request.body
    const updatedBlog = await Blog
        .findByIdAndUpdate(
            request.params.id, { title, author, url, likes }, { new: true, runValidators: true, context: 'query' }
        )
    response.json(updatedBlog)
})

module.exports = blogsRouter