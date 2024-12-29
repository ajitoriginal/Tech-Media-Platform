const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')

const connectDB = async () => {
    try {
        await mongoose.connect(db)
        console.log(`MongoDB connected to ${db}`)
    } catch(err) {
        console.log('err: ', err.message)
        console.error(err.message)
        process.exit(1)
    }
}

module.exports = connectDB