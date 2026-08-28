import { createRouter, createWebHashHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import Collect from '../components/Collect.vue'
import Worklog from '../components/Worklog.vue'
import Message from '../components/Message.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import { initAuth, store } from '../store'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: 'source',
      path: '/',
      component: HelloWorld
    },
    {
      path: '/collect',
      component: Collect
    },
    {
      path: '/worklog',
      component: Worklog
    },
    {
      path: '/message',
      component: Message
    },
    {
      name: 'login',
      path: '/login',
      component: Login,
      meta: { public: true }
    },
    {
      name: 'register',
      path: '/register',
      component: Register,
      meta: { public: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.beforeEach(async (to) => {
  if (to.meta.public) return true
  await initAuth()
  if (!store.user) return { name: 'login', query: { redirect: to.fullPath } }
})

export default router
