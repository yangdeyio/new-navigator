<template>
  <div class="auth-page">
    <AppBackground />
    <div class="auth-card app-panel">
      <div class="brand">
        <LogoMark :size="34" />
        <div class="logo">一览</div>
      </div>
      <div class="subtitle">一览无余，一触即达</div>
      <a-input
        v-model:value="username"
        size="large"
        placeholder="用户名（2-24 位字母数字下划线）"
        @press-enter="submit"
      >
        <template #prefix><UserOutlined /></template>
      </a-input>
      <a-input-password
        v-model:value="password"
        size="large"
        placeholder="密码（至少 8 位）"
        @press-enter="submit"
      >
        <template #prefix><LockOutlined /></template>
      </a-input-password>
      <a-input-password
        v-model:value="confirmed"
        size="large"
        placeholder="确认密码"
        @press-enter="submit"
      >
        <template #prefix><LockOutlined /></template>
      </a-input-password>
      <div class="error">{{ error }}</div>
      <a-button class="submit" type="primary" size="large" block :loading="loading" @click="submit">注册</a-button>
      <div class="hint">
        <router-link class="link" to="/login">已有账号？去登录</router-link>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { register } from '../store'
import AppBackground from './AppBackground.vue'
import LogoMark from './LogoMark.vue'
import { getApiError } from '../utils/api'

export default defineComponent({
  name: 'Register',
  components: { AppBackground, UserOutlined, LockOutlined, LogoMark },
  data() {
    return {
      username: '',
      password: '',
      confirmed: '',
      loading: false,
      error: ''
    }
  },
  methods: {
    async submit() {
      const username = this.username.trim()
      const password = this.password
      if (!username || !password || !this.confirmed) {
        this.error = '请填写完整'
        return
      }
      if (!/^[a-zA-Z0-9_-]{2,24}$/.test(username)) {
        this.error = '用户名需为 2-24 位字母、数字、下划线或中划线'
        return
      }
      if (password.length < 8) {
        this.error = '密码至少 8 位'
        return
      }
      if (password !== this.confirmed) {
        this.error = '两次输入的密码不一致'
        return
      }
      this.loading = true
      this.error = ''
      try {
        await register(username, password)
        this.$router.replace('/')
      } catch (e) {
        this.error = getApiError(e, '注册失败')
      } finally {
        this.loading = false
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.auth-page {
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

  .brand {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 4px;

    .logo {
      margin: 0;
    }
  }

  .logo {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 3px;
    text-align: center;
    margin-top: 0;
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
