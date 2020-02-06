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

  /** 转码并写入图片到服务器并返回地址
   * @param {string} tableName 表名
   * @param {string} update_column 更新语句
   * @param {string} data 数据
   * @param {string} UIDIndex 需要更新字段的UID
   * @param {function} callback 回调函数
   */
  function saveData(tableName, update_column, data, UIDIndex, callback) {
    query(`UPDATE ${tableName} SET ${update_column} WHERE ${UIDIndex}="${data[UIDIndex]}"`)
      .then(() => {
        callback('success', null)
      })
      .catch(err => {
        callback(null, '更新数据失败')
        console.log(err)
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
          saveData(tableName, update_column, data, UIDIndex, callback)
        })
        .catch(err => {
          callback(null, `图片保存失败，${err}`)
        })
    } else {
      // 更新语句
      let update_column = `personal_status='${data.personal_status}',personal_nickname='${data.personal_nickname}'`
      saveData(tableName, update_column, data, UIDIndex, callback)
    }
  }

  else if (tableName == 'plants_info') {
    // 图片地址 非本地 且 不为空
    if (!fs.existsSync(path.join(__dirname, `../../${data.plants_picture}`)) && data.plants_picture) {
      // 原有图片删除
      if (pictureUrl) {
        let fileIndex = pictureUrl.indexOf('/public')
        let filePath = pictureUrl.slice(fileIndex)
        fs.unlinkSync(path.join(__dirname, `../..${filePath}`))
      }
      // 写入新图片
      let imgData = data.plants_picture[0].base64
      let imgName = data.plants_picture[0].name
      saveImage(imgData, imgName, 'plants', data[UIDIndex])
        .then(path => {
          // 更新语句
          let update_column = `plants_name='${data.plants_name}',plants_introduction='${data.plants_introduction}',plants_picture='${path}',plants_distributions_uid='${data.plants_distributions_uid}'`
          saveData(tableName, update_column, data, UIDIndex, callback)
        })
        .catch(err => {
          callback(null, `图片保存失败，${err}`)
        })
    } else {
      // 更新语句
      let update_column = `plants_name='${data.plants_name}',plants_introduction='${data.plants_introduction}',plants_distributions_uid='${data.plants_distributions_uid}'`
      saveData(tableName, update_column, data, UIDIndex, callback)
    }
  }

  else if (tableName == 'location_info') {
    // 图片地址 非本地 且 不为空
    if (!fs.existsSync(path.join(__dirname, `../../${data.location_picture}`)) && data.location_picture) {
      // 原有图片删除
      if (pictureUrl) {
        let fileIndex = pictureUrl.indexOf('/public')
        let filePath = pictureUrl.slice(fileIndex)
        fs.unlinkSync(path.join(__dirname, `../..${filePath}`))
      }
      // 写入新图片
      let imgData = data.location_picture[0].base64
      let imgName = data.location_picture[0].name
      saveImage(imgData, imgName, 'location', data[UIDIndex])
        .then(path => {
          if (data.location_parent_uid.slice(0, 2) == data.location_uid.slice(0, 2)) {
            let update_column = `location_name='${data.location_name}',location_introduction='${data.location_introduction}',location_picture='${path}',location_parent_uid='${data.location_parent_uid}'`
            saveData(tableName, update_column, data, UIDIndex, callback)
            return
          }
          let UID
          query(`SELECT COUNT(*) FROM ${tableName} WHERE location_parent_uid='${data.location_parent_uid}'`)
            .then(count => {
              count = JSON.parse(count)
              count = count[0]['COUNT(*)']
              UID = parseInt(data.location_parent_uid) + count + 1
              query(`SELECT COUNT(*) FROM ${tableName} WHERE location_parent_uid='${data.location_parent_uid}'`)
              // 更新语句
              let update_column = `location_uid='${UID}',location_name='${data.location_name}',location_introduction='${data.location_introduction}',location_picture='${path}',location_parent_uid='${data.location_parent_uid}'`
              saveData(tableName, update_column, data, UIDIndex, callback)
            })
            .catch(err => {
              callback(null, `获取附属省份失败，${err}`)
            })
        })
        .catch(err => {
          callback(null, `图片保存失败，${err}`)
        })
    } else {
      if (data.location_parent_uid.slice(0, 2) == data.location_uid.slice(0, 2)) {
        let update_column = `location_name='${data.location_name}',location_introduction='${data.location_introduction}',location_parent_uid='${data.location_parent_uid}'`
        saveData(tableName, update_column, data, UIDIndex, callback)
        return
      }
      let UID
      query(`SELECT COUNT(*) FROM ${tableName} WHERE location_parent_uid='${data.location_parent_uid}'`)
        .then(count => {
          count = JSON.parse(count)
          count = count[0]['COUNT(*)']
          UID = parseInt(data.location_parent_uid) + count + 1
          // 更新语句
          let update_column = `location_uid='${UID}',location_name='${data.location_name}',location_introduction='${data.location_introduction}',location_parent_uid='${data.location_parent_uid}'`
          saveData(tableName, update_column, data, UIDIndex, callback)
        })
        .catch(err => {
          callback(null, `获取附属省份失败，${err}`)
        })
    }
  }

  else if (tableName == 'message_info') {
    query(`UPDATE ${tableName} SET message_isshow:='${data.message_isshow}' WHERE message_uid="${data.message_uid}"`)
      .then(() => {
        callback('success', null)
      })
      .catch(err => {
        callback(null, '更新数据失败')
        console.log(err)
      })
  }

}