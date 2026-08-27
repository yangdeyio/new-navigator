<template>
  <div id="app">
    <a-layout style="min-height: 100vh;">
      <a-layout-sider v-model:collapsed="collapsed" collapsible theme="dark">
        <div class="logo">一览</div>
        <a-menu
          theme="dark"
          mode="inline"
          :selected-keys="[activePath]"
          @click="onMenuClick"
        >
          <a-menu-item key="/">
            <HomeOutlined />
            <span>导航</span>
          </a-menu-item>
          <a-menu-item key="/collect">
            <StarOutlined />
            <span>收藏文章</span>
          </a-menu-item>
          <a-menu-item key="/worklog">
            <EditOutlined />
            <span>工作日志</span>
          </a-menu-item>
          <a-menu-item key="/message">
            <CommentOutlined />
            <span>留言板</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script>
import { HomeOutlined, StarOutlined, EditOutlined, CommentOutlined } from '@ant-design/icons-vue'

export default {
  name: 'App',
  components: {
    HomeOutlined,
    StarOutlined,
    EditOutlined,
    CommentOutlined
  },
  data() {
    return {
      collapsed: false
    }
  },
  computed: {
    activePath() {
      return this.$route.path === '' ? '/' : this.$route.path
    }
  },
  methods: {
    onMenuClick({ key }) {
      if (key !== this.$route.path) {
        this.$router.push(key)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
#app {
  .logo {
    height: 32px;
    margin: 16px;
    color: #ffffff;
    font-size: 18px;
    font-weight: 500;
    text-align: center;
    background: rgba(255, 255, 255, 0.2);
    line-height: 32px;
  }

  .content {
    background-image: url('https://cn.bing.com/th?id=OHR.UnkindnessRavens_ZH-CN2840574948_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp');
    background-size: cover;
  }
}
</style>
