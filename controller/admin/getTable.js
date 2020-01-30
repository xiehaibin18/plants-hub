const query = require('../mysql')

module.exports = function (tableName, search, page, callback) {
  let column_name
  switch (tableName) {
    case 'personal_info':
      column_name = `personal_uid,personal_status,personal_nickname`
      break;
    case 'plants_info':
      column_name = `plants_uid,plants_name,plants_introduction,plants_distributions_uid`
      break;
    case 'location_info':
      column_name = `location_uid,location_name,location_introduction,location_plants_uid`
      break;
    case 'message_info':
      column_name = `message_uid,message_sender_uid,message_receiver_uid,message_plants_uid,message_content,message_date,message_like,message_isshow`
      break;
  }
  let start = (page - 1) * 10;
  let data = {
    count: 0,
    list: []
  }
  let search_column_name = column_name

  switch (search) {
    case '正常':
      search = 0
      search_column_name = `personal_status`
      break;
    case '封禁中':
      search = 1
      search_column_name = `personal_status`
      break;
    case '异常':
      search = 2
      search_column_name = `personal_status`
      break;
    default:
      break;
  }

  query(`SELECT ${column_name} FROM ${tableName} WHERE CONCAT (${search_column_name}) LIKE '%${search}%' LIMIT ${start},10`)
    .then(res => {
      res = JSON.parse(res)
      data.list = res
      return query(`SELECT COUNT(*) FROM ${tableName} WHERE CONCAT (${search_column_name}) LIKE '%${search}%'`)
    })
    .then(res => {
      res = JSON.parse(res)
      data.count = res[0]['COUNT(*)']
      callback(data, null)
    })
    .catch(err => {
      callback(null, err)
    })
}
