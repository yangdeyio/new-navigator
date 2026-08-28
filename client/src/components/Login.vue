<template>
  <div class="login-page">
    <AppBackground />
    <div class="auth-card app-panel">
      <div class="logo">一览</div>
      <div class="subtitle">个人导航站 · 请登录</div>
      <a-input
        v-model:value="username"
        size="large"
        placeholder="用户名"
        @press-enter="submit"
      >
        <template #prefix><UserOutlined /></template>
      </a-input>
      <a-input-password
        v-model:value="password"
        size="large"
        placeholder="密码"
        @press-enter="submit"
      >
        <template #prefix><LockOutlined /></template>
      </a-input-password>
      <div class="error">{{ error }}</div>
      <a-button
        class="submit"
        type="primary"
        size="large"
        block
        :loading="loading"
        @click="submit"
      >登录</a-button>
      <div class="hint">
        <span v-if="!allowRegister">账号由管理员分配，暂不开放注册</span>
        <router-link v-else class="link" to="/register">没有账号？立即注册</router-link>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { store, login } from '../store'
import AppBackground from './AppBackground.vue'
import { getApiError } from '../utils/api'

export default defineComponent({
  name: 'Login',
  components: { AppBackground, UserOutlined, LockOutlined },
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: '',
      allowRegister: false
    }
  },
  async mounted() {
    if (store.user) {
      this.$router.replace('/')
      return
    }
    try {
      const { data } = await axios.get<{ allowRegister: boolean }>('/api/auth/config')
      this.allowRegister = data.allowRegister === true
    } catch {
      // 拿不到配置时按关闭注册处理
    }
  },
  methods: {
    async submit() {
      if (!this.username || !this.password) {
        this.error = '请输入用户名和密码'
        return
      }
      this.loading = true
      this.error = ''
      try {
        await login(this.username.trim(), this.password)
        const redirect = typeof this.$route.query.redirect === 'string' ? this.$route.query.redirect : '/'
        this.$router.replace(redirect)
      } catch (e) {
        this.error = getApiError(e, '登录失败')
      } finally {
        this.loading = false
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
}

.auth-card {
  width: 360px;
  max-width: 92vw;
  padding: 32px 28px 24px;
  box-sizing: border-box;

  :deep(.ant-input-affix-wrapper) {
    margin-bottom: 12px;
  }

  .logo {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 4px;
    text-align: center;
    background: linear-gradient(120deg, var(--accent), var(--accent-hover));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    text-align: center;
    color: var(--text-3);
    margin: 8px 0 24px;
    font-size: 13px;
  }

  .error {
    min-height: 20px;
    color: #ff4d4f;
    font-size: 12px;
    margin: 4px 0;
  }

  .submit {
    margin: 8px 0 16px;
  }

  .hint {
    text-align: center;
    color: var(--text-3);
    font-size: 12px;

    .link {
      color: var(--accent);
    }
  }
}
</style>
