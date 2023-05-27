const lodash = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => {
        return sum + blog.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.length === 0 ? null : blogs.reduce((prev, curr) => {
        return prev.likes > curr.likes ? prev : curr
    })
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0){
        return null
    }
    const authorCount = lodash.countBy(blogs, 'author')
    const topAuthor = Object.keys(authorCount).reduce((prev, curr) => {
        return authorCount[prev] > authorCount[curr] ? prev : curr
    })
    return {
        author: topAuthor,
        blogs: authorCount[topAuthor]
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0){
        return null
    }

    const likesCount = lodash(blogs).groupBy('author').map((objs, key) => ({
        author: key,
        likes: lodash.sumBy(objs, 'likes'),
    }))
        .value()

    return likesCount.reduce((a, b) => {
        return a.likes > b.likes ? a : b
    })
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}