const query = require('../mysql')

module.exports = function (type, callback) {
  let column = `SELECT location_uid,location_name FROM location_info ORDER BY location_uid ASC`
  if (type === 0) {
    column = `SELECT personal_uid AS uid,personal_nickname AS name FROM personal_info`
  }
  else if (type === 1) {
    column = `SELECT plants_uid AS uid,plants_name AS name FROM plants_info`
  }
  else if (type === 2) {
    column = `SELECT location_uid AS uid,location_name AS name FROM location_info ORDER BY location_uid ASC`
  }
  query(column)
    .then(data => {
      data = JSON.parse(data)
      callback(data, null)
    })
    .catch(err => {
      callback(null, err)
    })
}
