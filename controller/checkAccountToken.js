const query = require('./mysql')

module.exports = function (callback) {
  query(`SELECT account_token FROM admin WHERE account="admin"`)
    .then(res => {
      let account_token = JSON.parse(res)[0]["account_token"]
      account_token = new Date(account_token).getTime()
      let now = new Date()
      now = Date.parse(now)
      if ((now - account_token) < 1800000) {
        callback(true)
      } else {
        callback(false)
      }
    })
}