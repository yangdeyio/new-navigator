<template>
  <div id="app">
    <a-config-provider :theme="antdTheme">
      <router-view v-if="isAuthPage" />
      <template v-else-if="ready">
        <AppBackground />
        <header class="app-header">
          <div class="header-inner">
            <router-link class="logo" to="/">
              <LogoMark :size="26" class="logo-mark" />
              <span>一览</span>
            </router-link>
            <nav class="nav">
              <router-link
                v-for="item in navItems"
                :key="item.path"
                :to="item.path"
                class="nav-link"
                :class="{ active: activePath === item.path }"
              >
                <component :is="item.icon" />
                <span>{{ item.label }}</span>
              </router-link>
            </nav>
            <div class="header-actions">
              <button
                class="icon-btn"
                type="button"
                :title="theme === 'dark' ? '切换到浅色' : '切换到深色'"
                @click="toggleTheme"
              >
                <!-- antd 图标库没有日/夜图标,这里用内联 SVG(Feather 图标) -->
                <svg v-if="theme === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </button>
              <a-dropdown trigger="click">
                <span class="user-chip">
                  <span class="avatar">{{ initial }}</span>
                  <span class="username">{{ username }}</span>
                </span>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="password" @click="pwVisible = true">
                      <SettingOutlined /> 修改密码
                    </a-menu-item>
                    <a-menu-item key="logout" @click="onLogout">
                      <LogoutOutlined /> 退出登录
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <button
                class="icon-btn mobile-only"
                type="button"
                title="菜单"
                @click="navDrawer = true"
              >
                <MenuOutlined />
              </button>
            </div>
          </div>
        </header>
        <main class="app-main">
          <router-view />
        </main>
        <a-drawer v-model:open="navDrawer" placement="right" :width="280">
          <template #title>
            <span class="drawer-title">
              <LogoMark :size="20" />
              <span>一览</span>
            </span>
          </template>
          <div class="drawer-nav">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="drawer-link"
              :class="{ active: activePath === item.path }"
              @click="navDrawer = false"
            >
              <component :is="item.icon" />
              <span>{{ item.label }}</span>
            </router-link>
          </div>
          <div class="drawer-divider" />
          <div class="drawer-link" @click="pwVisible = true">
            <SettingOutlined />
            <span>修改密码</span>
          </div>
          <div class="drawer-link" @click="onLogout">
            <LogoutOutlined />
            <span>退出登录</span>
          </div>
        </a-drawer>
      </template>
      <template v-else>
        <AppBackground />
        <div class="boot-loading">
          <a-spin size="large" />
        </div>
      </template>
      <ChangePasswordModal :open="pwVisible" @close="pwVisible = false" />
    </a-config-provider>
  </div>
</template>

<script lang="ts">
import { defineComponent, type Component } from 'vue'
import {
  HomeOutlined,
  StarOutlined,
  EditOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined
} from '@ant-design/icons-vue'
import { store, logout } from './store'
import AppBackground from './components/AppBackground.vue'
import ChangePasswordModal from './components/ChangePasswordModal.vue'
import LogoMark from './components/LogoMark.vue'
import { theme, toggleTheme } from './composables/useTheme'
import { antdTheme } from './theme/theme'

interface NavItem {
  path: string
  label: string
  icon: Component
}

export default defineComponent({
  name: 'App',
  components: {
    HomeOutlined,
    StarOutlined,
    EditOutlined,
    LogoutOutlined,
    SettingOutlined,
    MenuOutlined,
    AppBackground,
    ChangePasswordModal,
    LogoMark
  },
  setup() {
    return { theme, toggleTheme, antdTheme }
  },
  data() {
    return {
      navDrawer: false,
      pwVisible: false,
      navItems: [
        { path: '/', label: '导航', icon: HomeOutlined },
        { path: '/collect', label: '收藏文章', icon: StarOutlined },
        { path: '/worklog', label: '工作日志', icon: EditOutlined }
      ] as NavItem[]
    }
  },
  computed: {
    isAuthPage() {
      return !!this.$route.meta.public
    },
    ready() {
      return store.ready
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
    async onLogout() {
      await logout()
      this.$router.replace('/login')
    }
  }
})
</script>
<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-h);
  background: var(--panel-bg);
  -webkit-backdrop-filter: var(--panel-blur);
  backdrop-filter: var(--panel-blur);
  border-bottom: 1px solid var(--panel-border);
}

.header-inner {
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-sizing: border-box;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-1);

  .logo-mark {
    flex-shrink: 0;
  }
}

.drawer-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;

  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 14px;
    border-radius: 999px;
    color: var(--text-2);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    transition: color 0.2s ease, background 0.2s ease;

    &:hover {
      color: var(--text-1);
      background: var(--surface-2-hover);
    }

    &.active {
      color: var(--accent);
      background: var(--accent-weak);
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-2);
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;

  &:hover {
    color: var(--accent);
    background: var(--surface-2-hover);
  }
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px 0 4px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: var(--surface-2-hover);
  }

  .avatar {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent-hover));
    color: #ffffff;
    font-size: 14px;
    line-height: 28px;
    text-align: center;
  }

  .username {
    color: var(--text-1);
    font-size: 14px;
    max-width: 120px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.app-main {
  min-height: calc(100vh - var(--header-h));
}

// 登录态判断期间的全屏占位:不渲染顶栏,避免重定向到登录页前顶栏漏出
.boot-loading {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .nav,
  .user-chip {
    display: none;
  }

  .mobile-only {
    display: inline-flex;
  }
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drawer-link {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  color: var(--text-2);
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease, background 0.2s ease;

  &:hover {
    color: var(--text-1);
    background: var(--surface-2-hover);
  }

  &.active {
    color: var(--accent);
    background: var(--accent-weak);
  }
}

.drawer-divider {
  height: 1px;
  margin: 12px 0;
  background: var(--surface-2-border);
}
</style>
