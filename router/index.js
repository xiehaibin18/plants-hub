const fs = require('fs')
const express = require('express')

const updataAccountToken = require('../controller/admin/updataAccountToken')
const checkAccountToken = require('../controller/admin/checkAccountToken')

const router = express.Router()


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

module.exports = router