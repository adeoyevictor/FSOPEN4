const app = require('./app')
const config = require('./utils.js/config')
const logger = require('./utils.js/logger')

app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
})