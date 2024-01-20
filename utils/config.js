require('dotenv').config()

MONGO_URL = process.env.MONGO_URL
PORT = process.env.PORT

module.exports = {
    MONGO_URL,
    PORT
}