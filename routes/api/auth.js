const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const auth = require('../../middleware/auth')

const User = require('../../models/User')

// @route  GET api/auth
// @desc   Test route
// @access Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(
            req.user.id
        )
        .select('-password')

        res.status(200).json(user)
    } catch(err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// @route  POST api/auth
// @desc   Authenticate user & get token
// @access Public
router.post(
    '/',
    [
        check('email', 'Please enter a valid email')
            .isEmail(),
        check('password', 'Password is required')
            .exists()
        
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const {email, password} = req.body

        try {
            // see if user exists
            let user = await User.findOne({email})

            if(!user) {
                return res.status(400).json({errors: [{msg: 'Invalid credentials'}]})
            }

            const isMatch = await bcrypt.compare(password, user.password)

            if(!isMatch) {
                return res.status(400).json({errors: [{msg: 'Invalid credentials'}]})
            }

            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtTokenSecret'),
                {expiresIn: config.get('jwtTokenExpiry')},
                (err, token) => {
                    if(err) throw err
                    res.json({token})
                }
            )
        } catch(err) {
            console.error(err.message)
            res.status(500).send('Server error')
        }
})

module.exports = router