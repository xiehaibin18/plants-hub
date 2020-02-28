const query = require('../mysql')

module.exports = function (data, callback) {
  let column
  if (data.type == 'allPlants') {
    // column = `SELECT  FROM plants_info p,location_info l WHERE p.plants_distributions_uid = l.location_uid`
    column = `SELECT plants_uid,plants_name,plants_introduction,plants_picture,plants_distributions_uid,plants_like FROM plants_info`
  }
  if (data.type == 'getUserInfo') {
    column = `SELECT personal_nickname,personal_avatar FROM personal_info WHERE account_token='${data.accountToken}'`
  }
  query(column)
    .then(res => {
      res = JSON.parse(res)
      if (data.type == 'allPlants') {
        res.forEach(element => {
          element.plants_picture = `http://192.168.0.105:3000${element.plants_picture}`
        });
      }
      if (data.type == 'getUserInfo') {
        res.forEach(element => {
          element.personal_avatar = `http://192.168.0.105:3000${element.personal_avatar}`
        });
      }
      callback(null, { 'err_code': 0, 'data': res })
    })
    .catch(err => {
      callback(err, null)
      console.log(err)
    })

}