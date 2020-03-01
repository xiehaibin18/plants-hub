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
    column = `INSERT INTO message_info(message_uid,message_sender_uid,message_receiver_uid,message_content,message_date,message_isshow)
    VALUES ('${uuid}','${data.accountToken.slice(0, 11)}','${data.receiverUid}','${data.content}','${date}',0)`
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