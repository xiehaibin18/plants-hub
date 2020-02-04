const query = require('../mysql')

module.exports = function (callback) {
  query(`SELECT location_uid,location_name FROM location_info`)
    .then(data => {
      data = JSON.parse(data)
      callback(data, null)
    })
    .catch(err => {
      callback(null, err)
    })
}