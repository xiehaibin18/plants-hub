const query = require('./mysql')

module.exports = function (acc, pwd) {
  let date = new Date().getTime() + 1800000;
  date = new Date(date)
  Y = date.getFullYear() + '-';
  M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
  h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':';
  m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
  s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
  date = Y + M + D + h + m + s
  return query(`UPDATE admin SET account_token="${date}" WHERE account="${acc}" AND password="${pwd}"`)
}
