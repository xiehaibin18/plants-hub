const path = require('path')
const fs = require('fs')

const query = require('../mysql')

module.exports = function (tableName, delUID, callback) {
  if (tableName && delUID) {
    // 删除数据的UID字段
    let column_name = tableName.slice(0, -4) + "uid";
    // 删除数据的UID值
    delUID = delUID.join()
    // 删除图片地址所在字段
    let filePath_column_name
    switch (tableName) {
      case 'personal_info':
        filePath_column_name = `personal_avatar`
        break;
      case 'plants_info':
        filePath_column_name = `plants_picture`
        break;
      case 'location_info':
        filePath_column_name = `location_picture`
        break;
      case 'message_info':
        filePath_column_name = `message_picture`
        break;
    }
    // 获取被删除的图片地址
    query(`SELECT ${filePath_column_name} FROM ${tableName} WHERE ${column_name} IN (${delUID})`)
      .then(data => {
        // 删除图片
        data = JSON.parse(data)
        if (data[0][filePath_column_name]) {
          data.forEach(filePath => {
            fs.unlinkSync(path.join(__dirname, `../..${filePath[filePath_column_name]}`))
          });
        }
        // 删除数据
        query(`DELETE FROM ${tableName} WHERE ${column_name} IN (${delUID})`)
          .then(() => {
            callback('success', null)
          })
          .catch(err => {
            callback(null, err)
          })
      })
  }
}