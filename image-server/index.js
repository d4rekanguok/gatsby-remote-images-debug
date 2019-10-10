const Koa = require('koa')
const serve = require('koa-static')
const logger = require('koa-logger')

const app = new Koa()

app.use(logger())
app.use(serve(__dirname + '/images'))

app.listen(3000)
console.log('listening on port 3000')