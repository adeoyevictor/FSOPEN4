const logger = require('./logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const config = require('../utils.js/config')

const errorHandler = (error, req, res, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({
            error: 'malfirmatted id'
        })
    } else if (error.name === 'ValidationError') {
        return res.status(400).send({
            error: error.message
        })
    } else if(error.name === 'JsonWebTokenError') {
        return res.status(400).json({ error: error.message })
    } else if(error.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'token expired'
        })
    }

    next(error)
}

const requestLogger = (req, res, next) => {
    logger.info('Method:', req.method)
    logger.info('Path:  ', req.path)
    logger.info('Body:  ', req.body)
    logger.info('---')
    next()
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({
        error: 'unknown endpoint'
    })
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')

    if(authorization && authorization.startsWith('Bearer ')) {
        request.token = authorization.replace('Bearer ', '')
    } else {
        request.token = null
    }

    next()
}

const userExtractor = async (request, response, next) => {
    const token = request.token

    if(token) {
        const decodedToken = jwt.verify(request.token, config.SECRET)
        const user = await User.findById(decodedToken.id)
        request.user = user
    }
    next()
}

module.exports = {
    errorHandler,
    requestLogger,
    unknownEndpoint,
    tokenExtractor,
    userExtractor
}