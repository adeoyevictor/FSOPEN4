const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../utils.js/config')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

test('returns the correct amount of blog posts in the JSON format', async () => {
    const res = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    expect(res.body).toHaveLength(helper.initialBlogs.length)
}, 100000)

test('id is defined', async () => {
    const res = await api
        .get('/api/blogs')

    res.body.forEach(blog => {
        expect(blog.id).toBeDefined()
    })
}, 100000)
describe('adding blog', () => {
    let token = null
    beforeAll(async () => {
        await User.deleteMany({})
        const passwordHash = await bcrypt.hash('12345', 10)
        const user = await new User({
            username: 'name',
            passwordHash
        }).save()
        const userForToken = {
            username: user.username,
            id: user._id
        }
        token = jwt.sign(userForToken, config.SECRET)
    })
    test('a valid blog can be added', async () => {
        const newBlog = {
            title: 'React Class Components',
            author: 'Adeoye Victor',
            likes: 7,
            url: 'http://example.com'
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

        const titles = blogsAtEnd.map(b => b.title)
        expect(titles).toContain('React Class Components')

    }, 100000)

    test('adding blog fails with correct status code if token is not provided', async () => {
        const newBlog = {
            title: 'React Class Components',
            author: 'Adeoye Victor',
            likes: 7,
            url: 'http://example.com'
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    }, 100000)
    test('likes default to zero', async () => {
        const newBlog = {
            title: 'React Class Components',
            author: 'Adeoye Victor',
            url: 'http://example.com'
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0)

    }, 100000)

    test('missing title is a bad request', async () => {
        const newBlog = {
            author: 'Adeoye Victor',
            likes: 5,
            url: 'http://example.com'
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)

    }, 100000)

    test('missing url is a bad request', async () => {
        const newBlog = {
            title: 'React Class Components',
            author: 'Adeoye Victor',
            likes: 5,
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)

    }, 100000)

})

test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).not.toContain(blogToDelete.title)
}, 100000)

test('a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send({
            title: 'React patterns',
            author: 'Michael Chan',
            likes: 17,
            url: 'http://example.com'
        })
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    expect(blogsAtEnd[0].likes).toBe(17)
}, 100000)


afterAll(async () => {
    await mongoose.connection.close()
})