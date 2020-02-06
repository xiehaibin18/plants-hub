const path = require('path')
const fs = require('fs')

const query = require('../mysql')
const UUID = require('../UUID')

module.exports = function (tableName, data, callback) {

  /** 转码并写入图片到服务器并返回地址
   * @param {string} imgData 图片base64码
   * @param {string} imgName 图片名
   * @param {string} filePath 保存地址
   */
  function saveImage(imgData, imgName, filePath, UID) {
    return new Promise((resolve, reject) => {
      let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
      let dataBuffer = Buffer.from(base64Data, 'base64');
      if (fs.existsSync(path.join(__dirname, `../../public/${filePath}/${UID}_${imgName}`))) {
        return reject('图片已存在')
      }
      fs.writeFile(path.join(__dirname, `../../public/${filePath}/${UID}_${imgName}`), dataBuffer, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(`/public/${filePath}/${UID}_${imgName}`)
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

  /** 写入图片与数据库数据
   * @param {Array} pictureArray 图片数据数组
   * @param {String} tableName 表名
   * @param {Object} data 数据
   * @param {String} column_name 字段
   * @param {Function} callback 回调函数
   */
  function addData(pictureArray, tableName, data, column_name, UID, callback) {
    pictureArray.forEach((foo, index) => {
      // 获取UUID
      let uuid = UUID(8, 10)
      if (UID) {
        uuid = UID
      }
      let imgData = foo.base64
      let imgName = foo.name
      let folder
      switch (tableName) {
        case 'personal_info':
          folder = 'avatar'
          break;
        case 'plants_info':
          folder = 'plants'
          break;
        case 'location_info':
          folder = 'location'
          break;
      }
      saveImage(imgData, imgName, folder, uuid)
        .then(path => {
          let VALUES
          if (tableName == 'personal_info') {
            VALUES = `${UID},'${data.personal_account}','${data.personal_password}','${data.personal_nickname}','${path}'`
          }
          else if (tableName == 'plants_info') {
            VALUES = `'${data.plants_name}','${data.plants_introduction}','${path}','${data.plants_distributions_uid}'`
          }
          else if (tableName == 'location_info') {
            VALUES = `'${UID}','${data.location_name}','${path}','${data.location_parent_uid}','${data.location_introduction}'`
          }
          query(`INSERT INTO ${tableName}(${column_name}) VALUES (${VALUES})`)
            .then(() => {
              if (index == pictureArray.length - 1) {
                callback('success', null)
              }
            })
            .catch(err => {
              if (index == pictureArray.length) {
                callback(null, '写入数据失败')
                console.log(err)
              }
            })
        })
        .catch(err => {
          callback(null, `图片保存失败，${err}`)
        })
    })
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
          if (data.personal_avatar != '') {
            // 字段名及值
            let column_name = `personal_uid,personal_account,personal_password,personal_nickname,personal_avatar`
            addData(data.personal_avatar, tableName, data, column_name, UID, callback)
          } else {
            // 字段名及值
            let column_name = `personal_uid,personal_account,personal_password,personal_nickname`
            let VALUES = `'${UID}','${data.personal_account}','${data.personal_password}','${data.personal_nickname}'`
            query(`INSERT INTO ${tableName}(${column_name}) VALUES (${VALUES})`)
              .then(() => {
                callback('success', null)
              })
              .catch(err => {
                callback(null, '写入数据失败')
                console.log(err)
              })
          }
        }
      })
      .catch(err => {
        callback(null, "验证手机号码失败")
        console.log(err)
      })
  }

  // 植物信息添加
  if (tableName == 'plants_info') {
    // 保存图片
    if (data.plants_picture != '') {
      // 字段名及值
      let column_name = `plants_name,plants_introduction,plants_picture,plants_distributions_uid`
      addData(data.plants_picture, tableName, data, column_name, null, callback)
    } else {
      // 字段名及值
      let column_name = `plants_name,plants_introduction,plants_distributions_uid`
      let VALUES = `'${data.plants_name}','${data.plants_introduction}','${data.plants_distributions_uid}'`
      query(`INSERT INTO ${tableName}(${column_name}) VALUES (${VALUES})`)
        .then(() => {
          callback('success', null)
        })
        .catch(err => {
          callback(null, '写入数据失败')
          console.log(err)
        })
    }
  }

  // 位置信息添加
  if (tableName == 'location_info') {
    // 保存图片
    if (data.location_picture != '') {
      // 字段名及值
      let column_name = `location_uid,location_name,location_picture,location_parent_uid,location_introduction`
      let UID
      query(`SELECT COUNT(*) FROM ${tableName} WHERE location_parent_uid='${data.location_parent_uid}'`)
        .then(count => {
          count = JSON.parse(count)
          count = count[0]['COUNT(*)']
          UID = parseInt(data.location_parent_uid) + count + 1
          addData(data.location_picture, tableName, data, column_name, UID, callback)
        })
        .catch(err => {
          callback(null, `获取附属省份失败，${err}`)
        })
    } else {
      let UID
      query(`SELECT COUNT(*) FROM ${tableName} WHERE location_parent_uid='${data.location_parent_uid}'`)
        .then(count => {
          count = JSON.parse(count)
          count = count[0]['COUNT(*)']
          UID = parseInt(data.location_parent_uid) + count + 1
          // 字段名及值
          let column_name = `location_uid,location_name,location_parent_uid,location_introduction`
          let VALUES = `'${UID}','${data.location_name}','${data.location_parent_uid}','${data.location_introduction}'`
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
          callback(null, `获取附属省份失败，${err}`)
        })



    }
  }

  // 添加留言信息
  if (tableName == 'message_info') {
    let message_object_name
    // 添加用户留言
    if (data.type === 0) {
      message_object_name = `message_sender_uid`
    }
    // 添加植物留言
    if (data.type === 1) {
      message_object_name = `message_plants_uid`
    }
    // 添加位置留言
    if (data.type === 2) {
      message_object_name = `message_location_uid`
    }
    let uuid = UUID(10, 10)
    date = new Date()
    Y = date.getFullYear() + '-';
    M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
    h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':';
    m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
    s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
    date = Y + M + D + h + m + s
    query(`INSERT INTO ${tableName}(message_uid,message_sender_uid,${message_object_name},message_content,message_date,message_isshow) VALUES ('${uuid}','admin','${data.message_object_uid}','${data.message_content}','${date}','${data.message_isshow}')`)
      .then(() => {
        callback('success', null)
      })
      .catch(err => {
        callback(null, '写入数据失败')
        console.log(err)
      })
  }
}
