const mysql = require('mysql')

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bishe'
})

module.exports = function (sql) {
  return new Promise((resolve, reject) => {
    pool.query(sql, function (err, results, fields) {
      if (err) {
        reject(err)
      } else {
        resolve(JSON.stringify(results), fields)
      }
    })
  })
}