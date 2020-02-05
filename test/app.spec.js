const app = require('../src/app')

describe('App', () => {
  it('GET / responds with 200 containing "I\'m gonna give it my all!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'I\'m gonna give it my all!')
  })
})