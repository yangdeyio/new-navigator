<template>
  <div class="auth-page" :style="bgStyle">
    <a-card class="auth-card" :bordered="false">
      <div class="logo">一览</div>
      <div class="subtitle">创建账号 · 开启你的导航站</div>
      <input v-model="username" class="field" type="text" placeholder="用户名（2-24 位字母数字下划线）" @keyup.enter="submit" />
      <input v-model="password" class="field" type="password" placeholder="密码（至少 8 位）" @keyup.enter="submit" />
      <input v-model="confirmed" class="field" type="password" placeholder="确认密码" @keyup.enter="submit" />
      <div class="error">{{ error }}</div>
      <a-button class="submit" type="primary" block :loading="loading" @click="submit">注册</a-button>
      <div class="hint">
        <router-link class="link" to="/login">已有账号？去登录</router-link>
      </div>
    </a-card>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { register } from '../store'
import { randomBackground } from '../utils/background'
import { getApiError } from '../utils/api'

export default defineComponent({
  name: 'Register',
  data() {
    return {
      username: '',
      password: '',
      confirmed: '',
      loading: false,
      error: '',
      bgUrl: randomBackground()
    }
  },
  computed: {
    bgStyle() {
      return {
        backgroundImage: `linear-gradient(135deg, rgba(24, 90, 157, 0.82), rgba(33, 26, 82, 0.86)), url('${this.bgUrl}')`
      }
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
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.auth-card {
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
    height: 38px;
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
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;

    .link {
      color: #1890ff;
    }
  }
}
</style>
