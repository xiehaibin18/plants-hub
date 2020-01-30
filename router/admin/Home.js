const express = require('express')

const getTable = require('../../controller/admin/getTable')

const router = express.Router()

router
  .post('/api/getTable', (req, res) => {
    /**
     * @param {string} search 搜索值
     * @param {string} page 页数
     * @param {function} 回调函数
     */
    getTable(req.body.search, req.body.page, (foo, err) => {
      if (foo) {
        res.status(200).json(foo)
      } else {
        console.log(err)
      }
    })
  })

module.exports = router
