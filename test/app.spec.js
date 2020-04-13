const app = require('../src/app')

describe('App', () => {
  it('GET / responds with 200 containing "Let\'s get it started in here!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Let\'s get it started in here!')
  })
})