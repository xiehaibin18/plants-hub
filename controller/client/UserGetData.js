const query = require('../mysql')

module.exports = function (data, callback) {
  let column
  let ip = `http://192.168.0.105:3000`
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
  if (data.type == 'getUserFavorite') {
    column = `SELECT personal_favorite_uid as id,personal_favorite_type as type,personal_favorite_item_uid as itemUid
    FROM personal_favorite_info
    WHERE personal_uid='${data.accountToken.slice(0, 11)}'
    ORDER BY personal_favorite_uid ASC`
  }
  query(column)
    .then(res => {
      res = JSON.parse(res)
      let counter = 0
      let resLength = res.length
      let notGlobalCallback = false
      if (data.type == 'allPlants') {
        res.forEach(element => {
          element.plants_picture = `${ip}${element.plants_picture}`
        });
      }
      if (data.type == 'getUserInfo') {
        res.forEach(element => {
          element.personal_avatar = `${ip}${element.personal_avatar}`
        });
      }
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
            element.avatar = `${ip}/public/avatar/admin.png`
          } else {
            notGlobalCallback = true
            element.senderUid = element.name
            query(`SELECT personal_nickname,personal_avatar FROM personal_info
          WHERE personal_uid LIKE '${element.name}%'`)
              .then(elementRes => {
                counter = counter + 1
                elementRes = JSON.parse(elementRes)
                element.name = elementRes[0].personal_nickname
                element.avatar = `${ip}${elementRes[0].personal_avatar}`
                if (counter == resLength) {
                  return callback(null, { 'err_code': 0, 'data': res })
                }
              })
          }
        });
      }
      if (data.type == 'getUserFavorite') {
        res.forEach(element => {
          notGlobalCallback = true
          if (element.type == 0) {
            query(`SELECT plants_name,plants_introduction,plants_picture
            FROM plants_info
            WHERE plants_uid='${element.itemUid}'`)
            .then(pres => {
              counter = counter + 1
              pres = JSON.parse(pres)
              element.name = pres[0].plants_name
              element.content = pres[0].plants_introduction
              element.picture = `${ip}${pres[0].plants_picture}`
              if (resLength == counter) {callback(null, { 'err_code': 0, 'data': res })}
            })
          } else if (element.type == 1) {
            query(`SELECT location_name,location_introduction,location_picture
            FROM location_info
            WHERE location_uid='${element.itemUid}'`)
            .then(lres => {
              counter = counter + 1
              lres = JSON.parse(lres)
              element.name = lres[0].location_name
              element.content = lres[0].location_introduction
              element.picture = `${ip}${lres[0].location_picture}`
              if (resLength == counter) {callback(null, { 'err_code': 0, 'data': res })}
            })
          }
        })
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