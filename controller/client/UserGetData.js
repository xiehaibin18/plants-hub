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
    WHERE message_isShow=0 AND message_receiver_uid LIKE '${data.accountToken.slice(0, 11)}%'
    ORDER BY message_date DESC`
  }
  if (data.type == 'getUserFavorite') {
    column = `SELECT personal_favorite_uid as id,personal_favorite_type as type,personal_favorite_item_uid as itemUid
    FROM personal_favorite_info
    WHERE personal_uid='${data.accountToken.slice(0, 11)}'
    ORDER BY personal_favorite_uid ASC`
  }
  if (data.type == 'getDetailData') {
    if (data.uidType == 0) {
      column = `SELECT plants_name as name,plants_introduction as introduction,plants_picture as picture,plants_distributions_uid,plants_like as itemLike
      FROM plants_info
      WHERE plants_uid=${parseInt(data.itemUid)}`
    } else {
      column = `SELECT location_name as name,location_introduction as introduction,location_picture as picture,location_like as itemLike
      FROM location_info
      WHERE location_uid='${data.itemUid}'`
    }
  }
  if (data.type == 'homeHot') {
    column = `SELECT plants_uid,plants_name,plants_introduction,plants_picture,plants_like
    FROM plants_info
    ORDER BY plants_like DESC`
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
                if (resLength == counter) { callback(null, { 'err_code': 0, 'data': res }) }
              })
          } else if (element.type == 1) {
            query(`SELECT location_name,location_introduction,location_picture,location_like
            FROM location_info
            WHERE location_uid='${element.itemUid}'`)
              .then(lres => {
                counter = counter + 1
                lres = JSON.parse(lres)
                element.name = lres[0].location_name
                element.content = lres[0].location_introduction
                element.picture = `${ip}${lres[0].location_picture}`
                if (resLength == counter) { callback(null, { 'err_code': 0, 'data': res }) }
              })
          }
        })
      }
      if (data.type == 'getDetailData') {
        notGlobalCallback = true
        // 获取 是否收藏 图片 点赞数
        let count = query(column = `SELECT COUNT(*) as count
        FROM personal_favorite_info
        WHERE personal_uid='${data.accountToken.slice(0, 11)}'
        AND personal_favorite_type=${data.uidType}
        AND personal_favorite_item_uid='${data.itemUid}'`)
          .then(countRes => {
            countRes = JSON.parse(countRes)
            if (countRes[0].count == 0) { res[0].isFavorite = 0 } else { res[0].isFavorite = 1 }
            res[0].picture = `${ip}${res[0].picture}`
            res[0].like = res[0].itemLike
          })
        // 获取 位置列表
        let location_info = query(`SELECT location_uid,location_name,location_introduction,location_picture,location_like
          FROM location_info
          WHERE location_uid='${res[0].plants_distributions_uid}'`)
          .then(locationRes => {
            locationRes = JSON.parse(locationRes)
            if (locationRes.length > 0) {
              res[0].location = locationRes
            }
          })
        // 获取 植物列表
        let plants_info = query(`SELECT plants_uid,plants_name,plants_introduction,plants_picture,plants_like
        FROM plants_info
        WHERE plants_distributions_uid='${data.itemUid}'`)
          .then(plantsRes => {
            plantsRes = JSON.parse(plantsRes)
            if (plantsRes.length > 0) {
              res[0].plants = plantsRes
            }
          })
        // 首先进行留言查询
        let messageLength
        query(`SELECT message_uid,message_sender_uid,message_receiver_uid,message_date,message_content,message_like
          FROM message_info
          WHERE ${data.uidType == 0 ? `message_plants_uid` : `message_location_uid`}='${data.itemUid}'`)
          .then(messageRes => {
            messageRes = JSON.parse(messageRes)
            messageLength = messageRes.length
            // 有留言进行留言者信息查询
            if (messageRes.length > 0) {
              messageRes.forEach(element => {
                let date = new Date(element.message_date)
                Y = date.getFullYear() + '-';
                M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
                D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
                h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':';
                m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
                s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
                date = Y + M + D + h + m + s
                element.message_date = date
                if (element.message_sender_uid == 'admin') {
                  messageLength = messageLength - 1
                  element.message_sender_uid = '系统通知'
                }
                else if (element.message_receiver_uid == 'null') {
                  query(`SELECT personal_nickname FROM personal_info
            WHERE personal_uid LIKE '${element.message_sender_uid}%'`)
                    .then(elementRes1 => {
                      messageLength = messageLength - 1
                      elementRes1 = JSON.parse(elementRes1)
                      element.message_sender_name = elementRes1[0].personal_nickname
                      element.message_receiver_name = ""
                      if (messageLength == 0) {
                        res[0].message = messageRes
                        if (data.uidType == 0) {
                          Promise.all([count, location_info])
                            .then(() => {
                              console.log(res)
                              return callback(null, { 'err_code': 0, 'data': res })
                            })
                        } else {
                          Promise.all([count, plants_info])
                            .then(() => {
                              console.log(res)
                              return callback(null, { 'err_code': 0, 'data': res })
                            })
                        }
                      }
                    })
                }
                else if (element.message_receiver_uid != 'null') {
                  Promise.all([
                    query(`SELECT personal_nickname FROM personal_info
              WHERE personal_uid LIKE '${element.message_sender_uid}%'`)
                      .then(elementRes1 => {
                        elementRes1 = JSON.parse(elementRes1)
                        element.message_sender_name = elementRes1[0].personal_nickname
                      })
                    ,
                    query(`SELECT personal_nickname FROM personal_info
                WHERE personal_uid LIKE '${element.message_receiver_uid}%'`)
                      .then(elementRes2 => {
                        elementRes2 = JSON.parse(elementRes2)
                        element.message_receiver_name = elementRes2[0].personal_nickname
                      })
                  ]).then(() => {
                    messageLength = messageLength - 1
                    if (messageLength == 0) {
                      res[0].message = messageRes
                      if (data.uidType == 0) {
                        Promise.all([count, location_info])
                          .then(() => {
                            console.log(res)
                            return callback(null, { 'err_code': 0, 'data': res })
                          })
                      } else {
                        Promise.all([count, plants_info])
                          .then(() => {
                            console.log(res)
                            return callback(null, { 'err_code': 0, 'data': res })
                          })
                      }
                    }
                  })
                }
              });
            } else {
              if (data.uidType == 0) {
                Promise.all([count, location_info])
                  .then(() => {
                    console.log(res)
                    return callback(null, { 'err_code': 0, 'data': res })
                  })
              } else {
                Promise.all([count, plants_info])
                  .then(() => {
                    console.log(res)
                    return callback(null, { 'err_code': 0, 'data': res })
                  })
              }
            }
          })
      }
      if (data.type == 'homeHot') {
        notGlobalCallback = true
        res.forEach(element => {
          element.plants_picture = `${ip}${element.plants_picture}`
        });
        query(`SELECT location_uid as plants_uid,location_name as plants_name,location_introduction as plants_introduction,location_picture as plants_picture,location_like as plants_like
        FROM location_info
        ORDER BY location_like DESC`)
        .then(hotRes => {
          hotRes = JSON.parse(hotRes)
          // res前5 
          resOut = res.splice(5)
          // hotRes前5 
          hotResOut = hotRes.splice(5)
          // 去除部分合并
          resOut.concat(hotResOut)
          // 去除部分打乱
          resOut.sort((a, b) => {
            return Math.random() > .5 ? -1 : 1
          })
          // 去除部分前5 
          resOut = resOut.splice(5)
          // 最终合并
          res = res.concat(hotRes)
          res = res.concat(resOut)
          // 最终打乱
          res.sort((a, b) => {
            return Math.random() > .5 ? -1 : 1
          })
          return callback(null, { 'err_code': 0, 'data': res })
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