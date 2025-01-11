const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
    // get token from header
    const token = req.header('x-auth-token')

    // check if token not found
    if(!token) {
        return res.status(401).json({msg: 'No token found, authorization denied'})
    }

    // verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtTokenSecret'))

        req.user = decoded.user
        next()
    } catch(err) {
        console.error(err.message)
        res.status(401).json({msg: 'Token is not valid'})
    }
}