const Blog = require('../models/blog')
const User = require('../models/user')


const initialBlogs = [
    {
        title: 'React patterns',
        author: 'Michael Chan',
        likes: 7,
        url: 'http://example.com'
    },
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        likes: 5,
        url: 'http://example.com'

    },
]


const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(blog => blog.toJSON())
}


module.exports = {
    initialBlogs, blogsInDb, usersInDb
}