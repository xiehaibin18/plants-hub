<template>
  <div class="login">
    <div class="box">
      <el-input class="input" placeholder="请输入账户" v-model="account" clearable></el-input>
      <el-input class="input" placeholder="请输入密码" v-model="password" show-password></el-input>
      <el-button class="login-btn" type="primary" @click="login">登录</el-button>
    </div>
  </div>
</template>

<script>
import api from '../assets/api'
import axios from 'axios'
export default {
  data() {
    return {
      account: null,
      password: null
    };
  },
  methods: {
    login () {
      let self = this
      if (!self.account) {
        self.$message({
          message: '请输入账户',
          type: 'warning'
        });
        return
      }
      if (!self.password) {
        self.$message({
          message: '请输入密码',
          type: 'warning'
        });
        return
      }
      self.$axios({
        url: api.Login,
        method: 'post',
        data: {
          account: self.account,
          password: self.password,
        }
      }).then(res => {
        if (res.data.err_code) {
          self.$message({
            message: res.data.message,
            type: 'warning'
          });
        } else {
          self.$router.replace('/home')
        }
      }, err => {
        self.$message({
          message: err,
          type: 'warning'
        });
      })
    }
  },
  beforeRouteEnter (to, from, next) {
    axios({
      url: api.checkLogin,
      method: 'post',
    }).then(res => {
      if (res.data.message) {
        next({ path: '/home' })
      } else {
        next()
      }
    })
  }
};
</script>

<style scoped>
.login {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  margin: 0;
}
.box {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  margin: 0 auto;
  width: 300px;
  height: 300px;
  /* background-color: #000; */
}
.input {
  margin-top: 10px;
}
.login-btn {
  float: right;
  margin-top: 10px;
}
</style>