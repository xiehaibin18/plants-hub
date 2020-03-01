const express = require('express')

const CheckAccountToken = require('../../controller/client/CheckAccountToken')
const CheckLogin = require('../../controller/client/CheckLogin')
const UserRegister = require('../../controller/client/UserRegister')
const UserGetData = require('../../controller/client/UserGetData')
const UserAddData = require('../../controller/client/UserAddData')

const router = express.Router()

router
  .post('/api/CheckAccountToken', (req, res) => {
    if (!req.body.accountToken) {
      res.status(400).json({"err_code": 400,"msg":"数据传输失败"})
    } else {
      CheckAccountToken(req.body.accountToken, (err, data) => {
        if (data) {
          res.status(200).json(data)
        } else {
          res.status(500).json({"err_code": 500,"msg":err})
        }
      })
    }
  })
  .post('/api/CheckLogin', (req, res) => {
    if (!req.body.account || !req.body.password) {
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
  .post('/api/UserRegister', (req, res) => {
    if (!req.body.account || !req.body.password || !req.body.nickname || !req.body.phone) {
      res.status(400).json({"err_code": 400,"msg":"数据传输失败"})
    } else {
      UserRegister(req.body, (err, data) => {
        if (data) {
          res.status(200).json(data)
        } else {
          res.status(500).json(err)
        }
      })
    }
  })
  .post('/api/UserGetData', (req, res) => {
    if (!req.body) {
      res.status(400).json({"err_code": 1,"msg":"数据传输失败"})
    } else {
      UserGetData(req.body, (err, data) => {
        if (data) {
          res.status(200).json(data)
        } else {
          res.status(500).json(err)
        }
      })
    }
  })
  .post('/api/UserAddData', (req, res) => {
    if (!req.body) {
      res.status(400).json({"err_code": 1,"msg":"数据传输失败"})
    } else {
      UserAddData(req.body, (err, data) => {
        if (data) {
          res.status(200).json(data)
        } else {
          res.status(500).json(err)
        }
      })
    }
  })

module.exports = router