<template>
  <div id="app">
    <router-view v-if="isAuthPage" />
    <a-layout v-else style="min-height: 100vh;">
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
        <div class="user-box" :class="{ collapsed }">
          <span class="avatar">{{ initial }}</span>
          <span v-if="!collapsed" class="username">{{ username }}</span>
          <LogoutOutlined v-if="!collapsed" class="logout" title="退出登录" @click="onLogout" />
        </div>
      </a-layout-sider>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script>
import { HomeOutlined, StarOutlined, EditOutlined, CommentOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { store, logout } from './store'

export default {
  name: 'App',
  components: {
    HomeOutlined,
    StarOutlined,
    EditOutlined,
    CommentOutlined,
    LogoutOutlined
  },
  data() {
    return {
      collapsed: false
    }
  },
  computed: {
    isAuthPage() {
      return !!this.$route.meta.public
    },
    username() {
      return (store.user && store.user.username) || ''
    },
    initial() {
      return (this.username[0] || '?').toUpperCase()
    },
    activePath() {
      return this.$route.path === '' ? '/' : this.$route.path
    }
  },
  methods: {
    onMenuClick({ key }) {
      if (key !== this.$route.path) {
        this.$router.push(key)
      }
    },
    async onLogout() {
      await logout()
      this.$router.replace('/login')
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

  .user-box {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;

    &.collapsed {
      justify-content: center;
      padding: 12px 8px;
    }

    .avatar {
      width: 28px;
      height: 28px;
      flex-shrink: 0;
      border-radius: 50%;
      background: #1890ff;
      color: #ffffff;
      font-size: 14px;
      line-height: 28px;
      text-align: center;
    }

    .username {
      flex: 1;
      margin-left: 10px;
      color: rgba(255, 255, 255, 0.85);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .logout {
      color: rgba(255, 255, 255, 0.45);
      cursor: pointer;

      &:hover {
        color: #ffffff;
      }
    }
  }

  .content {
    background-image:
      linear-gradient(135deg, rgba(24, 90, 157, 0.82), rgba(33, 26, 82, 0.86)),
      url('https://cn.bing.com/th?id=OHR.UnkindnessRavens_ZH-CN2840574948_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp');
    background-size: cover;
    background-position: center;
    min-height: 100vh;
  }
}
</style>
