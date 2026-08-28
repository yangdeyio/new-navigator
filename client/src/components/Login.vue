<template>
  <div class="login-page">
    <AppBackground />
    <a-card class="login-card" :bordered="false">
      <div class="logo">一览</div>
      <div class="subtitle">个人导航站 · 请登录</div>
      <input
        v-model="username"
        class="field"
        type="text"
        placeholder="用户名"
        @keypress.enter="submit"
      />
      <input
        v-model="password"
        class="field"
        type="password"
        placeholder="密码"
        @keypress.enter="submit"
      />
      <div class="error">{{ error }}</div>
      <a-button
        class="submit"
        type="primary"
        block
        :loading="loading"
        @click="submit"
      >登录</a-button>
      <div class="hint">
        <span v-if="!allowRegister">账号由管理员分配，暂不开放注册</span>
        <router-link v-else class="link" to="/register">没有账号？立即注册</router-link>
      </div>
    </a-card>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import { store, login } from '../store'
import AppBackground from './AppBackground.vue'
import { getApiError } from '../utils/api'

export default defineComponent({
  name: 'Login',
  components: { AppBackground },
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
}

.login-card {
  width: 360px;
  border-radius: 12px;

  .logo {
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    margin-top: 8px;
  }

  .subtitle {
    text-align: center;
    color: rgba(0, 0, 0, 0.45);
    margin: 8px 0 20px;
  }

  .field {
    width: 100%;
    height: 36px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    padding: 0 10px;
    margin-bottom: 12px;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #1890ff;
    }
  }

  .error {
    min-height: 20px;
    color: #ff4d4f;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .submit {
    margin-bottom: 12px;
  }

  .hint {
    text-align: center;
    color: rgba(0, 0, 0, 0.35);
    font-size: 12px;

    .link {
      color: #1890ff;
    }
  }
}
</style>
