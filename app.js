const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const session = require('express-session')

const router = require('./router')

const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

// parse application/json
app.use(bodyParser.json({limit: '50mb'}))


// 公开指定目录
const dist = './admin/dist'
app.use('/public/', express.static(path.join(__dirname, './public/')))
app.use('/dist/', express.static(path.join(__dirname, dist)))
app.use('/css/', express.static(path.join(__dirname, dist + '/css/')))
app.use('/img/', express.static(path.join(__dirname, dist + '/img/')))
app.use('/js/', express.static(path.join(__dirname, dist + '/js/')))
app.use('/fonts/', express.static(path.join(__dirname, dist + '/fonts/')))
// 配置session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
// 挂载路由
app.use(router)

app.listen(3000, function () {
  console.log('server is running, http://127.0.0.1:3000')
})