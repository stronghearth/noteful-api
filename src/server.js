const app = require('./app');
const { PORT } = require('./config');

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
  console.log('Let\'s get it started in here!')
})