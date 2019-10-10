const Koa = require('koa')
const serve = require('koa-static')
const logger = require('koa-logger')

const app = new Koa()

app.use(logger())
app.use(serve(__dirname + '/images'))

const PORT = process.env.PORT || 4000
app.listen(PORT)
console.log(`listening on port ${PORT}`)