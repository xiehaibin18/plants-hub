const fs = require('fs')
const express = require('express')

const updataAccountToken = require('../controller/admin/updataAccountToken')
const checkAccountToken = require('../controller/admin/checkAccountToken')
const pictureRecognition = require('../controller/pictureRecognition')

const router = express.Router()


router
  .get('/api/test', (req, res) => {
    console.log('succ')
    res.status(200).end('123')
  })
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
  .post('/api/pictureRecognition', (req, res) => {
    /** 图片识别
   * @param {string} roles 身份
   * @param {string} picture 图片信息
   * @param {function} 回调函数
   */
    pictureRecognition(req.body.roles, req.body.picture, (data, err) => {
      if (data) {
        res.status(200).json({ code: 0, data })
      } else {
        res.status(200).json({ code: 1, err })
      }
    })
  })

module.exports = router