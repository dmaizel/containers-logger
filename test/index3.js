const Logger = require('../src/logger')
const storage = require('../src/storage/index')

const logger = new Logger({
    loggerLabel: 'daniel',
    storage: storage
})

logger.start()