const mongoose = require('mongoose')
const Schema = mongoose.Schema

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const url = process.env.MONGODB_URI

mongoose.connect(url)
mongoose.Promise = global.Promise

const userSchema = new Schema({
  username: String,
  name: String,
  passwordHash: String,
  adult: Boolean,
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }]
})

userSchema.statics.format = function (user) {
  return {
    id: user._id,
    username: user.username,
    name: user.name,
    passwordHash: user.passwordHash,
    adult: user.adult,
    blogs: user.blogs
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User
