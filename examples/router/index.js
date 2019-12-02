import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  // {
  //   path: '/list',
  //   name: 'list',
  //   meta: {
  //     cacheTo: ['info', 'page-b']
  //   },
  //   component: () => import(/* webpackChunkName: "list" */ '../views/List.vue')
  // }
]

const router = new VueRouter({
  mode: 'hash',
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
  base: process.env.BASE_URL,
  routes
})

export default router
