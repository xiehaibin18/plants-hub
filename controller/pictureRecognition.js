const axios = require('axios');
const urlencode = require('urlencode');
const path = require('path')
const fs = require('fs')

const query = require('./mysql')
const UUID = require('./UUID')

/** 转码并写入图片到服务器并返回地址
 * @param {string} imgData 图片base64码
 * @param {string} imgName 图片名
 * @param {string} filePath 保存地址
 */
function saveImage(imgData, imgName, filePath, UID) {
  return new Promise((resolve, reject) => {
    let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    let dataBuffer = Buffer.from(base64Data, 'base64');
    if (fs.existsSync(path.join(__dirname, `../public/${filePath}/${UID}_${imgName}`))) {
      return reject('图片已存在')
    }
    fs.writeFile(path.join(__dirname, `../public/${filePath}/${UID}_${imgName}`), dataBuffer, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(`/public/${filePath}/${UID}_${imgName}`)
      }
    });
  })
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
          VALUES = `'${data.plants_name}','${data.plants_introduction}','${path}'`
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

module.exports = function (roles, data, callback) {

  let dataArray = []
  if(roles == 'client') {
    dataArray[0] = {}
    dataArray[0].base64 = data
    dataArray[0].size = 0
    data = dataArray
  }

  if (!data[0].base64) {
    return callback(null, '获取图片失败')
  }

  if (data[0].size > 1024000) {
    return callback(null, '识别图片需要小于或等于1M')
  }


  // 识图补全
    axios({
      method: "post",
      url: 'https://aip.baidubce.com/oauth/2.0/token',
      params: {
        grant_type: `client_credentials`,
        client_id: `kh9nTn8GfyVR7GXIZxu0xcNK`,
        client_secret: `C5YxdDGCbz3FtYniVOhPA9OkdhNqfi28`
      }
    }).then(key => {
      let access_token = key.data.access_token
      axios({
        method: "post",
        url: 'https://aip.baidubce.com/rest/2.0/image-classify/v1/plant',
        params: {
          access_token
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: `image=${urlencode(data[0].base64.replace(/^data:image\/\w+;base64,/, ""))}&baike_num=1`
      }).then(result => {
        if (result.data.result[0].name == '非植物') {
          return callback(null, '非植物')
        }
        if (result.data.result[0].score < 0.5) {
          return callback(null, '识别结果相似度小于50%')
        }
        if(roles == 'admin') {
          // 字段名及值
          let column_name = `plants_name,plants_introduction,plants_picture`
          data.plants_picture = data
          data.plants_name = result.data.result[0].name
          if (data.plants_introduction) {
            data.plants_introduction = `${result.data.result[0].baike_info.description.slice(0, 240)}...`
          } else {
            data.plants_introduction = '暂无'
          }
          addData(data.plants_picture, 'plants_info', data, column_name, null, callback)
        }
        if(roles == 'client') {
          return callback(null, `${JSON.stringify(result.data.result)}`)
        }
      }).catch(err => {
        callback(null, `请求百度识图失败，${err}`)
      })
    }).catch(err => {
      callback(null, `请求access_token失败，${err}`)
    })

}