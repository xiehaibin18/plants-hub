const express = require('express')

const CheckAccountToken = require('../../controller/client/CheckAccountToken')

const router = express.Router()

router
  .post('/api/CheckAccountToken', (req, res) => {
    console.log(req.body)
  })

module.exports = router