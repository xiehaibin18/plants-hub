const path = require('path')
const fs = require('fs')

const query = require('../mysql')

module.exports = function (data, callback) {
  if (!data.json[0].base64) {
    return callback(null, '获取数据失败')

  }

  return new Promise((resolve, reject) => {
    let base64Data = data.json[0].base64.replace(/^data:application\/json;base64,/, "");
    let dataBuffer = Buffer.from(base64Data, 'base64');
    let writePath = path.join(__dirname, `../../public/json/${data.json[0].name}`)
    fs.writeFile(writePath, dataBuffer, function (err) {
      if (err) {
        reject(err)

      } else {
        resolve(`${writePath}`)

      }

    });

  }).then(filePath => {
    new Promise((resolve, reject) => {
      fs.readFile(`${filePath}`, function (err, fileData) {
        if (err) {
          reject(err)

        } else {
          resolve(fileData)

        }
      })

    }).then(fileData => {
      fileData = fileData.toString()
      fileData = JSON.parse(fileData)
      let fileDataLength = fileData.length
      let counter = 0
      fileData.forEach(element => {
        if (element.name && element.introduction) {
          query(`INSERT INTO
          plants_info(plants_name,plants_introduction)
          VALUES
          ('${element.name}','${element.introduction}')`)
          .then(() => {
            counter = counter + 1
            if (counter == fileDataLength) {
              return callback('ok', null)
            }
            
          })
          .catch(err => {
            return callback(null, err)
          })

        } else {
          return callback(null, '格式出错')

        }

      })

    }).catch(err => {
      console.log(err)
      return callback(null, '服务器出错')

    })

  }).catch(err => {
    return callback(null, err)

  })

}
