const path = require('path')
const fs = require('fs')

const query = require('../mysql')
const UUID = require('../UUID')

module.exports = function (data, callback) {
  let notGlobalCallback = false
  if (data.type == 'senderUserMessage') {
    let uuid = UUID(10, 10)
    date = new Date()
    Y = date.getFullYear() + '-';
    M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
    h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':';
    m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
    s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
    date = Y + M + D + h + m + s
    if (data.messageType == 0) { data.msgloc = `message_plants_uid` } else if (data.messageType == 1) { data.msgloc = `message_location_uid` }
    column = `INSERT INTO message_info(message_uid,message_sender_uid,message_receiver_uid,${data.msgloc},message_content,message_date,message_isshow)
    VALUES ('${uuid}','${data.accountToken.slice(0, 11)}','${data.receiverUid}','${data.messageLocation}','${data.content}','${date}',0)`
  }
  if (data.type == 'messageLike') {
    column = `UPDATE message_info SET message_like=message_like+1 WHERE message_uid='${data.messageId}'`
  }
  if (data.type == 'userDoFavorite') {
    if (data.isFavorite == 0) {
      column = `INSERT INTO personal_favorite_info(personal_uid,personal_favorite_type,personal_favorite_item_uid)
      VALUES ('${data.accountToken.slice(0, 11)}',${parseInt(data.uidType)},'${data.itemUid}')`
    } else {
      column = `DELETE FROM personal_favorite_info
      WHERE personal_uid='${data.accountToken.slice(0, 11)}' AND personal_favorite_type=${parseInt(data.uidType)} AND personal_favorite_item_uid='${data.itemUid}'`
    }
  }
  if (data.type == 'PorLLike') {
    if (data.itemType == 0) {
      column = `UPDATE plants_info SET plants_like=plants_like+1 WHERE plants_uid='${data.itemUid}'`
    } else {
      column = `UPDATE location_info SET location_like=location_like+1 WHERE location_uid='${data.itemUid}'`
    }
  }
  if (data.type == 'UpdateUserInfo') {
    notGlobalCallback = true
    // return console.log(data.oldData.slice(0,6) == 'avatar')
    if (data.oldData.slice(0, 6) == 'avatar') {
      if (data.oldData.slice(33)) {
        // 有原图
        let fileIndex = data.oldData.indexOf('/public')
        let filePath = data.oldData.slice(fileIndex)
        fs.unlinkSync(path.join(__dirname, `../..${filePath}`))
      }
      new Promise((resolve, reject) => {
        let base64Data = data.newData.replace(/^data:image\/\w+;base64,/, "");
        let dataBuffer = Buffer.from(base64Data, 'base64');
        fs.writeFile(path.join(__dirname, `../../public/avatar/${data.accountToken}.jpeg`), dataBuffer, function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(`/public/avatar/${data.accountToken}.jpeg`)
          }
        });
      }).then(filePath => {
        query(`UPDATE
        personal_info
        SET
        personal_avatar='${filePath}'
        WHERE
        account_token='${data.accountToken}'`)
          .then(() => {
            return callback(null, { 'err_code': 0, 'data': 'ok' })
          })
      })
    } else if (data.oldData.slice(0, 4) == 'name') {
      query(`UPDATE
        personal_info
        SET
        personal_nickname='${data.newData}'
        WHERE
        account_token='${data.accountToken}'`)
        .then(() => {
          return callback(null, { 'err_code': 0, 'data': 'ok' })
        })
    }
  }
  if (!notGlobalCallback) {
    query(column)
      .then(res => {
        callback(null, { 'err_code': 0, 'data': res })
      })
      .catch(err => {
        callback(err, null)
        console.log(err)
      })
  }
}