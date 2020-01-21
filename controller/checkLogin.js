const query = require('./mysql')
const updataAccountToken = require('./updataAccountToken')

module.exports = function (acc, pwd, callback) {
  query(`SELECT COUNT(*) FROM admin WHERE account="${acc}"`)
    .then(results => {
      // console.log(JSON.parse(results)[0]['COUNT(*)'])
      if (JSON.parse(results)[0]['COUNT(*)'] == 0) {
        return callback(null, { 'err_code': 1, 'message': '账户错误'})
      } else {
        return query(`SELECT COUNT(*) FROM admin WHERE account="${acc}" AND password="${pwd}"`)
      }
    }, err => {
      return callback(err, null)
    })
    .then(results => {
      if (!results) {return}
      if (JSON.parse(results)[0]['COUNT(*)'] == 0) {
        return callback(null, { 'err_code': 2, 'message': '密码错误'})
      } else {
        callback(null, { 'err_code': 0, 'message': 'ok'})
        updataAccountToken(acc, pwd)
      }
    })
}
