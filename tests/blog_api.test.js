const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const listHelper = require('../utils/list_helper')
const totalLikes = require('../utils/list_helper').totalLikes
const maxLikes = require('../utils/list_helper').maxLikes
const favoriteBlog = require('../utils/list_helper').favoriteBlog
const mostBlogs = require('../utils/list_helper').mostBlogs
const mostLikes = require('../utils/list_helper').mostLikes
const { format, initialBlogs, nonExistingId, blogsInDb, usersInDb } = require('./test_helper')
const User = require('../models/user')

describe('Have db with blogs to test', async () => {

  beforeAll(async () => {
    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .post('/api/login')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await Blog.remove({})

    const blogObjects = initialBlogs.map(b => new Blog(b))
    await Promise.all(blogObjects.map(b => b.save()))
  })

  describe('GET calls', async () => {
    test('all blogs are returned as json by GET /api/blogs', async () => {
      const blogsInDatabase = await blogsInDb()

      const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(response.body.length).toBe(blogsInDatabase.length)

      const returnedTitles = response.body.map(b => b.title)
      blogsInDatabase.forEach(blog => {
        expect(returnedTitles).toContain(blog.title)
      })
    })

    test('return a specific blog', async () => {
      const resultAll = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const aBlogFromAll = resultAll.body[0]

      const resultBlog = await api
        .get(`/api/blogs/${aBlogFromAll.id}`)

      const blogObject = resultBlog.body

      expect(blogObject).toEqual(aBlogFromAll)
    })
  })

  describe('POST calls', async () => {
    beforeAll(async () => {
      await User.remove({})
      const newUser = {
          username: "toimiva",
          name: "passu",
          adult: false,
          password: "tyyli"
      }

      await api
          .post('/api/users')
          .send(newUser)
          .expect(200)
    })

    test('POST /api/blogs succeeds with valid data', async () => {
      const blogsAtStart = await blogsInDb()

      const newBlog = {
        title: 'The most important title',
        author: 'James Bond',
        url: 'www.testi.com',
        likes: 0
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAfterOperation = await blogsInDb()

      expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)

      const titles = blogsAfterOperation.map(b => b.title)
      expect(titles).toContain('The most important title')
    })

    test('POST /api/blogs succeeds with undefined likes', async () => {
      const blogsAtStart = await blogsInDb()

      const newBlog = {
        title: 'Blog with undefined likes',
        author: 'James Bond',
        url: 'www.testi.com'
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAfterOperation = await blogsInDb()

      expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)

      const titles = blogsAfterOperation.map(b => b.title)
      expect(titles).toContain('Blog with undefined likes')
    })

    test('POST /api/blogs fails with undefined title', async () => {
      const blogsAtStart = await blogsInDb()

      const newBlog = {
        author: 'Undefined title',
        url: 'www.testi.com',
        likes: 0
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAfterOperation = await blogsInDb()

      expect(blogsAfterOperation.length).toBe(blogsAtStart.length)

      const titles = blogsAfterOperation.map(b => b.author)
      expect(titles).not.toContain('Undefined title')
    })

    test('POST /api/blogs fails with undefined url', async () => {
      const blogsAtStart = await blogsInDb()

      const newBlog = {
        title: 'Blog with undefined URL',
        author: 'Undefined url',
        likes: 0
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAfterOperation = await blogsInDb()

      expect(blogsAfterOperation.length).toBe(blogsAtStart.length)

      const titles = blogsAfterOperation.map(b => b.author)
      expect(titles).not.toContain('Undefined url')
    })

  })

  describe('totalLikes', async () => {

    test('of many is caclulated right', () => {
      expect(totalLikes(initialBlogs)).toBe(51)
    })

    test('of empty array is zero', async () => {
      expect(totalLikes([])).toBe(0)
    })
  })

  describe('maxLikes', async () => {

    test('of maxLikes works', async () => {
      expect(maxLikes(initialBlogs)).toBe(15)
    })

    test('of maxLikes works with no blogs', async () => {
      expect(maxLikes([])).toBe(0)
    })
  })

  describe('favoriteBlog', async () => {

    test('of favoriteBlog works', () => {
      expect(favoriteBlog(initialBlogs)).toEqual(initialBlogs[1])
    })

    test('of favoriteBlog works with no blogs', () => {
      expect(favoriteBlog([])).toBe(0)
    })
  })

  describe('mostBlogs', () => {
    test('of most blogs works', () => {
      expect(mostBlogs(initialBlogs)).toEqual(
        {
          author: "Robert C. Martin",
          blogs: 3
        })
    })
  })

  describe('authorWithmostLikes', () => {
    test('of most likes works', () => {
      expect(mostLikes(initialBlogs)).toEqual(
        {
          author: "Edsger W. Dijkstra",
          likes: 17
        })
    })
  })

  describe('DELETE calls', async () => {
      let addedBlog

      beforeAll(async () => {
        addedBlog = new Blog({
          author:'To be deleted',
          title: 'To be deleted',
          url: 'www.deletethis.com',
          likes: 0
        })
        await addedBlog.save()
      })

      test('DELETE /api/blogs/:id succeeds with proper status code', async () => {
        const blogsAtStart = await blogsInDb()

        await api
          .delete(`/api/blogs/${addedBlog._id}`)
          .expect(204)

        const blogsAfterOperation = await blogsInDb()

        const titles = blogsAfterOperation.map(b => b.title)

        expect(titles).not.toContain(addedBlog.title)
        expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1)
      })
    })

  describe('Update calls', async () => {
    let toBeUpdatedBlog

    beforeAll(async () => {
      toBeUpdatedBlog = new Blog({
        author:'To be updated',
        title: 'To be updated',
        url: 'www.updatethis.com',
        likes: 0
      })
      await toBeUpdatedBlog.save()
    })

    test('PUT /api/blogs/:id succeeds', async () => {
      const blogsAtStart = await blogsInDb()
      const updatedBlog = new Blog({
        author:'UPDATEDBLOG',
        title: 'UPDATEDBLOG',
        url: 'UPDATEDBLOG',
        likes: 500
      })

      await api
        .put(`/api/blogs/${toBeUpdatedBlog._id}`)
        .send(updatedBlog)

      const blogsAfterOperation = await blogsInDb()

      const titles = blogsAfterOperation.map(b => b.title)

      expect(titles).not.toContain(toBeUpdatedBlog.title)
      expect(titles).toContain(updatedBlog.title)
      expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
    })

  })

})

afterAll(async () => {
  await User.remove({})
  await Blog.remove({})
  server.close()
})
