<template>
  <div class="login-page">
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
      <div class="hint">账号由管理员分配,暂不开放注册</div>
    </a-card>
  </div>
</template>
<script>
import { store, login } from '../store'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: ''
    }
  },
  mounted() {
    if (store.user) this.$router.replace('/')
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
        const redirect = this.$route.query.redirect || '/'
        this.$router.replace(redirect)
      } catch (e) {
        this.error = (e.response && e.response.data && e.response.data.error) || '登录失败'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('https://cn.bing.com/th?id=OHR.UnkindnessRavens_ZH-CN2840574948_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp');
  background-size: cover;
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
  }
}
</style>
