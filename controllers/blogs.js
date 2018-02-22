const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/info', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

 blogsRouter.get('/', async (request, response) => {

   const blogs = await Blog
     .find({})
     .populate('user', {username:1, name:1})
   response.json(blogs.map(Blog.format))
})

blogsRouter.get('/:id', async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id)

    if (blog) {
      console.log(blog)
      response.json(Blog.format(blog))
    } else {
      response.status(404).end()
    }

  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

blogsRouter.post('/', async (request, response) => {
const body = request.body

  try {
    const token = request.token
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if (body.title === undefined || body.url === undefined) {
      return response.status(400).json({ error: 'title or url missing' })
    }

    if (body.likes === undefined) {
      body.likes = 0
    }

    const loggedUser = await User.findById(decodedToken.id)

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: loggedUser._id
    })
    const savedBlog = await blog.save()

    loggedUser.blogs = loggedUser.blogs.concat(savedBlog._id)
    await loggedUser.save()

    response.json(Blog.format(blog))
  } catch(error) {
    if (error.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: error })
    } else {
      console.log(error)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const token = request.token
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = await Blog.findById(request.params.id)
    const addedUser = await User.findById(blog.user)

    const deletingUser = await User.findById(decodedToken.id)
    console.log(addedUser)
    console.log(deletingUser)
    console.log(addedUser._id === deletingUser._id, 'tässä totuus')

    if (addedUser.toString() === deletingUser.toString()) {
      await Blog.findByIdAndRemove(request.params.id)
      response.status(204).end()
    } else {
      response.status(401).send({ error: 'You can only delete your own blogs' })
    }

  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'väärä id' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  try {
    const token = request.token
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const body = request.body

    const blog = {
      title: body.title,
      author: body.title,
      url: body.url,
      likes: body.likes
    }

    await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(Blog.format(blog))
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

module.exports = blogsRouter
