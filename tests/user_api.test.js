const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const listHelper = require('../utils/list_helper')
const { usersInDb } = require('./test_helper')
const User = require('../models/user')

describe('when there is initially one user at db', async () => {

  beforeAll( async () => {
    await User.remove({})
    const user = new User({ username: 'root', password: 'sekret' })
    await user.save()
  })

  test('POST /api/users doesnt work with password less than 3 chars long', async () => {
        const usersBeforeOperation = await usersInDb()

        const newUser = {
            username: "lyhyt",
            name: "passu",
            adult: false,
            password: "ty"
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAfterOperation = await usersInDb()

        expect(usersBeforeOperation.length).toBe(usersAfterOperation.length)
    })

  test('POST /api/users defaults "adult" to true if null', async () => {
      const newUser = {
          username: "pitkä",
          name: "pitkä",
          password: "toimii"
      }

      await api
          .post('/api/users')
          .send(newUser)
          .expect(200)


      const usersBeforeOperation = await usersInDb()

      const adults = usersBeforeOperation.map(r => r.adult)
      expect(adults).toContain(true)

  })

  test('POST /api/users succeeds with a fresh username', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'mluukkaiAito',
      name: 'Matti Luukkainen',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
    const usernames = usersAfterOperation.map(u=>u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('POST /api/users fails with proper statuscode and message if username already taken', async () => {
      const usersBeforeOperation = await usersInDb()

      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body).toEqual({ error: 'username must be unique'})

      const usersAfterOperation = await usersInDb()
      expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
    })
})

afterAll( async () => {
  await User.remove({})
  server.close()
})
