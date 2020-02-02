const path = require('path')
const fs = require('fs')

const query = require('../mysql')

module.exports = function (tableName, data, callback) {

  /** 转码并写入图片到服务器并返回地址
   * @param {string} imgData 图片base64码
   * @param {string} imgName 图片名
   * @param {string} filePath 保存地址
   */
  function saveImage(imgData, imgName, filePath) {
    return new Promise((resolve, reject) => {
      let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
      let dataBuffer = Buffer.from(base64Data, 'base64');
      fs.writeFile(path.join(__dirname, `../../public/${filePath}/${imgName}`), dataBuffer, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(`/public/${filePath}/${imgName}`)
        }
      });
    })
  }

  /** 生成返回UID
   * @param {string} number 手机号码
   */
  function createUID(number) {
    // 获取日期信息
    let date = new Date()
    let UID = null
    let Y = date.getFullYear()
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
    let D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate())
    date = `${Y}${M}${D}`
    // 合并手机号码和日期信息生成UID
    return UID = `${number}${date}`
  }

  // 个人信息添加
  if (tableName == 'personal_info') {

    // 检查手机号码是否注册
    query(`SELECT COUNT(*) FROM personal_info WHERE personal_uid LIKE '${data.personal_number}%'`)
      .then(res => {
        res = JSON.parse(res)
        if (res[0]['COUNT(*)'] > 0) {
          callback(null, '手机号码已注册')
        } else {
          // 获取UID
          UID = createUID(data.personal_number)
          // 保存图片
          let imgData = data.personal_avatar[0].base64
          let imgName = data.personal_avatar[0].name
          saveImage(imgData, imgName, 'avatar')
            .then(path => {
              // 字段名及值
              let column_name = `personal_uid,personal_account,personal_password,personal_nickname,personal_avatar`
              let VALUES = `${UID},'${data.personal_account}','${data.personal_password}','${data.personal_nickname}','${path}'`
              query(`INSERT INTO ${tableName}(${column_name}) VALUES (${VALUES})`)
                .then(() => {
                  callback('success', null)
                })
                .catch(err => {
                  callback(null, '写入数据失败')
                  console.log(err)
                })
            })
            .catch(err => {
              callback(null, '图片保存失败')
              console.log(err)
            })
        }
      })
      .catch(err => {
        callback(null, "验证手机号码失败")
        console.log(err)
      })
  }

}
