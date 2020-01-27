const express = require('express')

const checkLogin = require('../../controller/admin/checkLogin')

const router = express.Router()

router
  .post('/api/isLogin', (req, res) => {
    // 通过session判断是否登录
    if (req.session.isLogin) {
      return res.status(200).json({ 'message': true })
    } else {
      res.status(200).json({ 'message': false })
    }
  })
  .post('/api/admin', (req, res) => {
    checkLogin(req.body.account, req.body.password, (err, results) => {
      if (err) {
        res.status(500).json({ 'message': 'sever err' })
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

module.exports = router
