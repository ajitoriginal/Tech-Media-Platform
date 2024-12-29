const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
    const msg = 'API is running...'
    console.log(msg)
    res.send(msg)

})

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`)
})