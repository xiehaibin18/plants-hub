const query = require('../mysql')

module.exports = function (data, callback) {
  // console.log(data.account)
  query(`SELECT COUNT(*) FROM personal_info WHERE personal_account="${data.account}"`)
    .then(res => {
      if (JSON.parse(res)[0]['COUNT(*)'] == 0) {
        return callback(null, { 'err_code': 2, 'message': '账户错误' })
      } else {
        return query(`SELECT COUNT(*) FROM personal_info WHERE personal_account="${data.account}" AND personal_password="${data.password}"`)
      }
    }, err => {
      return callback(err, null)
    })
    .then(res => {
      if (!res) {return}
      if (JSON.parse(res)[0]['COUNT(*)'] == 0) {
        return callback(null, { 'err_code': 3, 'message': '密码错误' })
      } else {
        let account_token = new Date().getTime() + 259200000;
        query(`UPDATE personal_info SET account_token="${data.account}-${account_token}" WHERE personal_account="${data.account}" AND personal_password="${data.password}"`)
        callback(null, { 'err_code': 0, 'account_token': `${data.account}-${account_token}` })
      }
    }, err => {
      return callback(err, null)
    })
}