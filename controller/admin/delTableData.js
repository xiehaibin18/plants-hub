const query = require('../mysql')

module.exports = function (tableName, delUID, callback) {
  if (tableName && delUID) {
    let column_name = tableName.slice(0, -4) + "uid";
    delUID = delUID.join()
    query(`DELETE FROM ${tableName} WHERE ${column_name} IN (${delUID})`)
      .then(() => {
        callback('success', null)
      })
      .catch(err => {
        callback(null, err)
      })
    
  }
}