const query = require('../mysql')

module.exports = function (search, page, callback) {
  let column_name = `personal_uid,personal_status,personal_nickname`
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

  query(`SELECT ${column_name} FROM personal_info WHERE CONCAT (${search_column_name}) LIKE '%${search}%' LIMIT ${start},10`)
    .then(res => {
      res = JSON.parse(res)
      data.list = res
      return query(`SELECT COUNT(*) FROM personal_info WHERE CONCAT (${search_column_name}) LIKE '%${search}%'`)
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
