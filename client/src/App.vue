<template>
  <div id="app">
    <router-view v-if="isAuthPage" />
    <template v-else>
      <AppBackground />
      <a-layout style="min-height: 100vh; background: transparent;">
      <a-layout-sider
        v-model:collapsed="collapsed"
        collapsible
        theme="dark"
        breakpoint="lg"
        :collapsed-width="0"
      >
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
          <!-- <a-menu-item key="/message">
            <CommentOutlined />
            <span>留言板</span>
          </a-menu-item> -->
        </a-menu>
        <div class="user-box" :class="{ collapsed }">
          <span class="avatar">{{ initial }}</span>
          <span v-if="!collapsed" class="username">{{ username }}</span>
          <SettingOutlined
            v-if="!collapsed"
            class="action"
            title="修改密码"
            @click="pwVisible = true"
          />
          <LogoutOutlined v-if="!collapsed" class="action" title="退出登录" @click="onLogout" />
        </div>
      </a-layout-sider>
      <a-layout-content class="content" style="background: transparent;">
        <router-view />
      </a-layout-content>
      </a-layout>
    </template>
    <ChangePasswordModal :open="pwVisible" @close="pwVisible = false" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { HomeOutlined, StarOutlined, EditOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { store, logout } from './store'
import AppBackground from './components/AppBackground.vue'
import ChangePasswordModal from './components/ChangePasswordModal.vue'

export default defineComponent({
  name: 'App',
  components: {
    HomeOutlined,
    StarOutlined,
    EditOutlined,
    LogoutOutlined,
    SettingOutlined,
    AppBackground,
    ChangePasswordModal
  },
  data() {
    return {
      collapsed: false,
      pwVisible: false
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
    onMenuClick({ key }: { key: string | number }) {
      const path = String(key)
      if (path !== this.$route.path) {
        this.$router.push(path)
      }
    },
    async onLogout() {
      await logout()
      this.$router.replace('/login')
    }
  }
})
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

    .action {
      color: rgba(255, 255, 255, 0.45);
      cursor: pointer;

      & + .action {
        margin-left: 12px;
      }

      &:hover {
        color: #ffffff;
      }
    }
  }

  .content {
    min-height: 100vh;
  }
}
</style>
