const query = require('../mysql')

module.exports = function (data, callback) {
  let column
  if (data.type == 'allPlants') {
    // column = `SELECT  FROM plants_info p,location_info l WHERE p.plants_distributions_uid = l.location_uid`
    column = `SELECT plants_uid,plants_name,plants_introduction,plants_picture,plants_distributions_uid,plants_like FROM plants_info`
  }
  if (data.type == 'getUserInfo') {
    column = `SELECT personal_nickname,personal_avatar FROM personal_info WHERE account_token='${data.accountToken}'`
  }
  if (data.type == 'getUserMessage') {
    column = `SELECT message_uid as id,message_sender_uid as name,message_date as time,message_content as content,message_plants_uid,message_location_uid
    FROM message_info
    WHERE message_isShow=0 AND message_receiver_uid LIKE '${data.accountToken.slice(0, 11)}________'
    ORDER BY message_date DESC`
  }
  query(column)
    .then(res => {
      res = JSON.parse(res)
      if (data.type == 'allPlants') {
        res.forEach(element => {
          element.plants_picture = `http://192.168.0.105:3000${element.plants_picture}`
        });
      }
      if (data.type == 'getUserInfo') {
        res.forEach(element => {
          element.personal_avatar = `http://192.168.0.105:3000${element.personal_avatar}`
        });
      }
      let counter = 0
      let resLength = res.length
      let notGlobalCallback = false
      if (data.type == 'getUserMessage') {
        res.forEach(element => {
          let date = new Date(element.time)
          Y = date.getFullYear() + '-';
          M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
          D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
          h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':';
          m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
          s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
          date = Y + M + D + h + m + s
          element.time = date
          if (element.name == 'admin') {
            resLength = resLength - 1
            element.name = '系统通知'
            element.avatar = `http://192.168.0.105:3000/public/avatar/admin.png`
          } else {
            notGlobalCallback = true
            query(`SELECT personal_nickname,personal_avatar FROM personal_info
          WHERE personal_uid='${element.name}'`)
              .then(elementRes => {
                counter = counter + 1
                elementRes = JSON.parse(elementRes)
                element.name = elementRes[0].personal_nickname
                element.avatar = `http://192.168.0.105:3000${elementRes[0].personal_avatar}`
                if (counter == resLength) {
                  return callback(null, { 'err_code': 0, 'data': res })
                }
              })
          }
        });
      }
      if (!notGlobalCallback) {
        callback(null, { 'err_code': 0, 'data': res })
      }
    })
    .catch(err => {
      callback(err, null)
      console.log(err)
    })

}