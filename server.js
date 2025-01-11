const express = require('express')
const connectDB = require('./config/db')
const path = require('path')
const cors = require('cors');

const PORT = process.env.PORT || 5000
const app = express()

// connect database
connectDB()

const corsOptions = {
    origin: ["https://tech-media-platform-ui.onrender.com"],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Enable credentials (e.g., cookies, authorization headers)
    optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  };

app.use(cors(corsOptions));

// init middleware
app.use(express.json({extented: false})) // to read req.body

// define routes
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/user', require('./routes/api/user'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/post', require('./routes/api/post'))

// server static assets in production
if(process.env.NODE_ENV === 'production') {
    // set static folder
    app.use(express.static('client/build'))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`)
})
