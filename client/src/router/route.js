import { createRouter, createWebHashHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import Collect from '../components/Collect.vue'
import Worklog from '../components/Worklog.vue'
import Message from '../components/Message.vue'

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
    }
  ]
})

export default router
