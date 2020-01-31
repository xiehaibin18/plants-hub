const express = require('express')

const getTableData = require('../../controller/admin/getTableData')
const delTableData = require('../../controller/admin/delTableData')

const router = express.Router()

router
  .post('/api/getTableData', (req, res) => {
    /**
     * @param {string} tableName 表名
     * @param {string} search 搜索值
     * @param {string} page 页数
     * @param {function} 回调函数
     */
    getTableData(req.body.tableName, req.body.search, req.body.page, (foo, err) => {
      if (foo) {
        res.status(200).json(foo)
      } else {
        res.status(500)
        console.log(err)
      }
    })
  })
  .post('/api/adminDel', (req, res) => {
    console.log(req.body)
  })

module.exports = router
