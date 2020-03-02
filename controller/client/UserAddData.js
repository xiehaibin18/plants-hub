const query = require('../mysql')

const UUID = require('../UUID')

module.exports = function (data, callback) {
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
  query(column)
    .then(res => {
      callback(null, { 'err_code': 0, 'data': res })
    })
    .catch(err => {
      callback(err, null)
      console.log(err)
    })
}