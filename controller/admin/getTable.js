const query = require('../mysql')

module.exports = function (callback) {
  query(`SELECT * FROM personal_info`)
    .then(res => {
      callback(res)
    })
}