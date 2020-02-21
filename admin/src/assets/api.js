// let ip = `http://192.168.0.103:3000`
let ip = `http://127.0.0.1:3000`
export default {
  ip,
  Login: `${ip}/api/admin`,
  checkLogin: `${ip}/api/isLogin`,
  getTableData: `${ip}/api/getTableData`,
  adminDelData: `${ip}/api/adminDelData`,
  adminAddData: `${ip}/api/adminAddData`,
  adminUpdataData: `${ip}/api/adminUpdataData`,
  adminGetLocationData: `${ip}/api/adminGetLocationData`,
  adminSignout: `${ip}/api/adminSignout`,
  pictureRecognition: `${ip}/api/pictureRecognition`,
}