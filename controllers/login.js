const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username })
  const passwordCorrect = user === null ?
    false :
    await bcrypt.compare(body.password, user.passwordHash)

  if ( !(user && passwordCorrect) ) {
    console.log('MMMMMMMMMMMMMMMMMIIIIIIIIIIIIIIIIIIIITTTTTTTTTTTTTTTTTTTTTTTÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ!')
    return response.status(401).send({ error: 'invalid username or password' })
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET)
  console.log('ONNISTUI AIVAN HELVETIN HYVIN ONNISTUI AIVAN HELVETIN HYVIN ONNISTUI AIVAN HELVETIN HYVIN')
  response.status(200).send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter