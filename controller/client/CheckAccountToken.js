const query = require('../mysql')

module.exports = function (accountToken, callback) {
  if (accountToken == 'tourists') {
    return callback(null, { 'err_code': 0, 'message': 'ok' })
  }
  query(`SELECT COUNT(*) FROM personal_info WHERE account_token="${accountToken}"`)
    .then(res => {
      if (JSON.parse(res)[0]['COUNT(*)'] == 0) {
        return callback(null, { 'err_code': 1, 'message': '无' })
      } else if (JSON.parse(res)[0]['COUNT(*)'] > 1) {
        return callback(null, { 'err_code': 2, 'message': '数据出错' })
      } else {
        return callback(null, { 'err_code': 0, 'message': 'ok' })
      }
    }, err => {
      return callback(err, null)
    })
}