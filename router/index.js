const fs = require('fs')
const express = require('express')

const checkLogin = require('../controller/checkLogin')
const updataAccountToken = require('../controller/updataAccountToken')
const checkAccountToken = require('../controller/checkAccountToken')

const router = express.Router()

// let isLogin = false

router
.get('/*', (req, res) => {
  fs.readFile('./admin/dist/index.html', 'utf-8', (err, content) => {
    if (err) {
      console.log('We cannot open "index.htm" file.', err)
    }
    res.send(content)
  })
  checkAccountToken(foo => {
    if (foo && req.session.isLogin) {
      // 验证活跃状态成功，设置session
      req.session.isLogin = true
      // 验证活跃状态成功，更新活跃状态
      return updataAccountToken('admin', 'admin')
    } else {
      // 验证活跃状态失败，清除session
      req.session.isLogin = false
    }
  })
})
.post('/api/isLogin', (req, res) => {
  // 通过session判断是否登录
  if (req.session.isLogin) {
    return res.status(200).json({'message': true})
  } else {
    res.status(200).json({'message': false})
  }
})
.post('/api/admin', (req, res) => {
  checkLogin(req.body.account, req.body.password, (err, results) => {
    if (err) {
      res.status(500).json({'message': 'sever err'})
      return console.log(err)
    }
    if (results.err_code == 0) {
      // 验证登陆成功，设置session
      req.session.isLogin = true
    } else {
      // 验证登陆失败，清除session
      req.session.isLogin = false
    }
    res.status(200).json(results)
  })
})
.post('/api/testimages', (req, res) => {
  console.log(req.body)
})

module.exports = router