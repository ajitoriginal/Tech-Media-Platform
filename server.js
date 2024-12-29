const express = require('express')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000
const app = express()

// connect database
connectDB()

app.get('/', (req, res) => {
    const msg = 'API is running...'
    console.log(msg)
    res.send(msg)

})

// define routes
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/user', require('./routes/api/user'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/post', require('./routes/api/post'))

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`)
})