<template>
  <div class="home">
    <pf-uploadimage></pf-uploadimage>
  </div>
</template>

<script>
import api from '../assets/api'
import axios from 'axios'

export default {
  beforeRouteEnter (to, from, next) {
    axios({
      url: api.checkLogin,
      method: 'post',
    }).then(res => {
      if (res.data.message) {
        next()
      } else {
        next({ path: '/' })
      }
    })
  }
}
</script>

<style>

</style>