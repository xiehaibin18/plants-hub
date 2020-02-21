const axios = require('axios');
const urlencode = require('urlencode');
const path = require('path')
const fs = require('fs')

const query = require('./mysql')
const UUID = require('./UUID')

module.exports = function (roles, data, callback) {
  
  if (!data[0].base64) {
    return callback(null, '获取图片失败')
  }

  if (data[0].size > 1024000) {
    return callback(null, '识别图片需要小于或等于1M')
  }

  // 识图补全
  if (roles == 'admin') {
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
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: `image=${urlencode(data[0].base64.replace(/^data:image\/\w+;base64,/, ""))}&baike_num=1`
      }).then(result => {
        console.log(result.data.result[0].baike_info)
        callback(result.data, null)
      }).catch(err => {
        console.log(err)
      })
    }).catch(err => {
      console.log(err)
    })
  }
}