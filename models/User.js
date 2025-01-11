const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

UserSchema.plugin(require('mongoose-timestamp'));
UserSchema.plugin(require('mongoose-delete'), {
    overrideMethods: true,
    deletedAt: true
});


module.exports = User = mongoose.model('user', UserSchema)