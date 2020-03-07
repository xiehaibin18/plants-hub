const query = require('../mysql')

  /** 生成返回UID
   * @param {string} number 手机号码
   */
  function createUID(number) {
    // 获取日期信息
    let date = new Date()
    let UID = null
    let Y = date.getFullYear()
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
    let D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate())
    date = `${Y}${M}${D}`
    // 合并手机号码和日期信息生成UID
    return UID = `${number}${date}`
  }

module.exports = function (data, callback) {
  // 检查手机号码是否注册
  query(`SELECT COUNT(*) FROM personal_info WHERE personal_uid LIKE '${data.phone}%' OR personal_account='${data.account}'`)
  .then(res => {
    res = JSON.parse(res)
    if (res[0]['COUNT(*)'] > 0) {
      callback(null, { 'err_code': 1, 'message': '手机号码或者账号已注册' })
    } else {
      // 获取UID
      UID = createUID(data.phone)
      // 字段名及值
      let column_name = `personal_uid,personal_account,personal_password,personal_nickname`
      let VALUES = `'${UID}','${data.account}','${data.password}','${data.nickname}'`
      query(`INSERT INTO personal_info(${column_name}) VALUES (${VALUES})`)
        .then(() => {
          let lots = new Date().getTime() + 259200000;
          let phone = JSON.parse(res)[0].personal_uid.slice(0,11)
          query(`UPDATE personal_info SET account_token="${phone}-${lots}" WHERE personal_account="${data.account}" AND personal_password="${data.password}"`)
          callback(null, { 'err_code': 0, 'account_token': `${phone}-${lots}` })
        })
        .catch(err => {
          callback(err, null)
          console.log(err)
        })
    }
  })
  .catch(err => {
    callback("验证手机号码失败", null)
    console.log(err)
  })
}