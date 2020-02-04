const path = require('path')
const fs = require('fs')

const query = require('../mysql')

module.exports = function (tableName, data, pictureUrl, callback) {

  /** 转码并写入图片到服务器并返回地址
   * @param {string} imgData 图片base64码
   * @param {string} imgName 图片名
   * @param {string} filePath 保存地址
   */
  function saveImage(imgData, imgName, filePath, UID) {
    return new Promise((resolve, reject) => {
      let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
      let dataBuffer = Buffer.from(base64Data, 'base64');
      fs.writeFile(path.join(__dirname, `../../public/${filePath}/${UID}_${imgName}`), dataBuffer, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(`/public/${filePath}/${UID}_${imgName}`)
        }
      });
    })
  }

  // 需要更新字段的UID
  let UIDIndex = tableName.slice(0, -4) + "uid";

  if (tableName == 'personal_info') {
    // 账号状态预处理
    switch (data.personal_status) {
      case '正常':
        data.personal_status = 0
        break;
      case '封禁':
        data.personal_status = 1
        break;
    }
    // 图片地址 非本地 且 不为空
    if (!fs.existsSync(path.join(__dirname, `../../${data.personal_avatar}`)) && data.personal_avatar) {
      // 原有图片删除
      if (pictureUrl) {
        let fileIndex = pictureUrl.indexOf('/public')
        let filePath = pictureUrl.slice(fileIndex)
        fs.unlinkSync(path.join(__dirname, `../..${filePath}`))
      }
      // 写入新图片
      let imgData = data.personal_avatar[0].base64
      let imgName = data.personal_avatar[0].name
      saveImage(imgData, imgName, 'avatar', data[UIDIndex])
        .then(path => {
          // 更新语句
          let update_column = `personal_status='${data.personal_status}',personal_nickname='${data.personal_nickname}',personal_avatar='${path}'`
          query(`UPDATE ${tableName} SET ${update_column} WHERE ${UIDIndex}="${data[UIDIndex]}"`)
            .then(() => {
              callback('success', null)
            })
            .catch(err => {
              callback(null, '更新数据失败')
              console.log(err)
            })
        })
        .catch(err => {
          callback(null, `图片保存失败，${err}`)
        })
    } else {
      // 更新语句
      let update_column = `personal_status='${data.personal_status}',personal_nickname='${data.personal_nickname}'`
      query(`UPDATE ${tableName} SET ${update_column} WHERE ${UIDIndex}="${data[UIDIndex]}"`)
        .then(() => {
          callback('success', null)
        })
        .catch(err => {
          callback(null, '更新数据失败')
          console.log(err)
        })
    }
  }
}