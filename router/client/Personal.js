const express = require('express')

const CheckAccountToken = require('../../controller/client/CheckAccountToken')
const CheckLogin = require('../../controller/client/CheckLogin')

const router = express.Router()

router
  .post('/api/CheckAccountToken', (req, res) => {
    if (!req.body.accountToken) {
      res.status(400).json({"err_code": 1,"msg":"数据传输失败"})
    } else {
      CheckAccountToken(req.body.accountToken, (err, data) => {
        if (data) {
          res.status(200).json(data)
        } else {
          res.status(500).json(err)
        }
      })
    }
  })
  .post('/api/CheckLogin', (req, res) => {
    if (!req.body.account && !req.body.password) {
      res.status(400).json({"err_code": 1,"msg":"数据传输失败"})
    } else {
      CheckLogin(req.body, (err, data) => {
        if (data) {
          res.status(200).json(data)
        } else {
          res.status(500).json(err)
        }
      })
    }
  })

module.exports = router