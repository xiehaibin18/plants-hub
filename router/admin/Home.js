const express = require('express')

const checkAccountToken = require('../../controller/admin/checkAccountToken')
const updataAccountToken = require('../../controller/admin/updataAccountToken')
const getTableData = require('../../controller/admin/getTableData')
const delTableData = require('../../controller/admin/delTableData')
const addTableData = require('../../controller/admin/addTableData')
const updataTableData = require('../../controller/admin/updataTableData')
const getLocationData = require('../../controller/admin/getLocationData')
const pictureRecognition = require('../../controller/pictureRecognition')

const router = express.Router()

router
  .post('/api/getTableData', (req, res) => {
    // 获取表单前验证活跃状态
    new Promise((resolve, reject) => {
      checkAccountToken(foo => {
        if (foo && req.session.isLogin) {
          // 验证活跃状态成功，设置session
          req.session.isLogin = true
          // 验证活跃状态成功，更新活跃状态
          updataAccountToken('admin', 'admin')
          resolve()
        } else {
          // 验证活跃状态失败，清除session
          req.session.isLogin = false
          reject()
        }
      })
    }).then(() => {
      /** 获取表单数据
       * @param {string} tableName 表名
       * @param {string} search 搜索值
       * @param {string} page 页数
       * @param {function} 回调函数
       */
      getTableData(req.body.tableName, req.body.search, req.body.page, (data, err) => {
        if (data) {
          res.status(200).json({ code: 200, data })
        } else {
          res.status(500)
          console.log(err)
        }
      })
    }).catch(() => {
      res.status(200).json({ code: 300 })
    })
  })
  .post('/api/adminDelData', (req, res) => {
    /** 删除表单数据
       * @param {string} tableName 表名
       * @param {string} delUID 主键值
       * @param {function} 回调函数
       */
    delTableData(req.body.tableName, req.body.delUID, (data, err) => {
      if (data) {
        res.status(200).json(data)
      } else {
        res.status(500).json('删除失败')
        console.log(err)
      }
    })
  })
  .post('/api/adminAddData', (req, res) => {
    /** 添加表单数据
       * @param {string} tableName 表名
       * @param {string} data 添加数据
       * @param {function} 回调函数
       */
    addTableData(req.body.tableName, req.body, (data, err) => {
      if (data) {
        res.status(200).json({ code: 0, data })
      } else {
        res.status(200).json({ code: 1, err })
      }
    })
  })
  .post('/api/adminUpdataData', (req, res) => {
    /** 修改表单数据
       * @param {string} tableName 表名
       * @param {string} data 添加数据
       * @param {string} pictureUrl 原图片地址
       * @param {function} 回调函数
       */
    updataTableData(req.body.tableName, req.body.data, req.body.pictureUrl, (data, err) => {
      if (data) {
        res.status(200).json({ code: 0, data })
      } else {
        res.status(200).json({ code: 1, err })
      }
    })
  })
  .post('/api/adminGetLocationData', (req, res) => {
    getLocationData(req.body.type, (data, err) => {
      if (data) {
        res.status(200).json(data)
      } else {
        console.log(err)
      }
    })
  })
  .post('/api/adminSignout', (req, res) => {
    req.session.isLogin = false
    res.status(200).json({ 'message': 'Signout success' })
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
