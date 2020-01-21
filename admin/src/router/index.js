import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  { path: '*',
    component:  () => import('../views/Notfind.vue')
  },
  { path: '/',
    name: 'login',
    component:  () => import('../views/Login.vue')
  },
  { path: '/Login',
    name: 'login',
    component:  () => import('../views/Login.vue')
  },
  { path: '/Home',
    name: 'home',
    component:  () => import('../views/Home.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
