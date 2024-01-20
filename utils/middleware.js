const logger = require('../utils/logger')

const requestLogger = (request, response, next) => {
    logger.info('Method',request.method)
    logger.info('Path',request.path)
    logger.info('Body',request.body)
    logger.info('------------------')
    next()
}

const errorHandler = (error,request,response,next) => {
    logger.error(error.name)
    return response.status(400).json({error: error.message})
    next(error)
}

const unknownEndpoint = (request,response) =>{
    response.status(404).json({error: 'unknown Endpoint'})
}

module.exports = {
    requestLogger,
    errorHandler,
    unknownEndpoint
}