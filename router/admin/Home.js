const express = require('express')

const getTable = require('../../controller/admin/getTable')

const router = express.Router()

router
  .post('/api/getTable', (req, res) => {
    getTable(foo => {
      if (foo) {
        res.status(200).json(foo)
      }
    })
  })

module.exports = router
