const query = require('../mysql')

module.exports = function (data, callback) {
  let column
  if (data.type == 'allPlants') {
    // column = `SELECT  FROM plants_info p,location_info l WHERE p.plants_distributions_uid = l.location_uid`
    column = `SELECT plants_uid,plants_name,plants_introduction,plants_picture,plants_distributions_uid,plants_like FROM plants_info`
  }
  query(column)
    .then(data => {
      data = JSON.parse(data)
      data.forEach(element => {
        element.plants_picture = `http://192.168.0.105:3000${element.plants_picture}`
      });
      callback(null, { 'err_code': 2, 'data': data })
    })
    .catch(err => {
      callback(err, null)
    })

}