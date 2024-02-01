require('dotenv').config()

MONGO_URL = process.env.MONGO_URL
PORT = process.env.PORT
BASE_URL = process.env.BASE_URL

module.exports = {
    MONGO_URL,
    PORT,
    BASE_URL
}