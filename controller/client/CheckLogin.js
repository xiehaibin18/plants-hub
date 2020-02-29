const query = require('../mysql')

module.exports = function (data, callback) {
  // console.log(data.account)
  query(`SELECT COUNT(*) FROM personal_info WHERE personal_account="${data.account}"`)
    .then(res => {
      if (JSON.parse(res)[0]['COUNT(*)'] == 0) {
        return callback(null, { 'err_code': 2, 'message': '账户错误' })
      } else {
        return query(`SELECT personal_uid FROM personal_info WHERE personal_account="${data.account}" AND personal_password="${data.password}"`)
      }
    }, err => {
      return callback(err, null)
    })
    .then(res => {
      if (!res) {return};
      if (JSON.parse(res).length == 0) {
        return callback(null, { 'err_code': 3, 'message': '密码错误' })
      } else {
        let lots = new Date().getTime() + 259200000;
        let phone = JSON.parse(res)[0].personal_uid.slice(0,11)
        query(`UPDATE personal_info SET account_token="${phone}-${lots}" WHERE personal_account="${data.account}" AND personal_password="${data.password}"`)
        callback(null, { 'err_code': 0, 'account_token': `${phone}-${lots}` })
      }
    }, err => {
      return callback(err, null)
    })
}