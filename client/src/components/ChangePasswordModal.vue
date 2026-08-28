<template>
  <a-modal
    :open="open"
    title="修改密码"
    :confirm-loading="saving"
    ok-text="确认修改"
    cancel-text="取消"
    @ok="onOk"
    @cancel="$emit('close')"
  >
    <div class="field">
      <label>当前密码</label>
      <a-input-password v-model:value="currentPassword" autocomplete="current-password" />
    </div>
    <div class="field">
      <label>新密码</label>
      <a-input-password
        v-model:value="newPassword"
        placeholder="至少 8 位"
        autocomplete="new-password"
      />
    </div>
    <div class="field">
      <label>确认新密码</label>
      <a-input-password v-model:value="confirmPassword" autocomplete="new-password" />
    </div>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { message } from 'ant-design-vue'
import { changePassword } from '../store'
import { getApiError } from '../utils/api'

export default defineComponent({
  name: 'ChangePasswordModal',
  props: {
    open: { type: Boolean, default: false }
  },
  emits: ['close'],
  data() {
    return {
      saving: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  },
  methods: {
    reset() {
      this.currentPassword = ''
      this.newPassword = ''
      this.confirmPassword = ''
      this.saving = false
    },
    async onOk() {
      if (!this.currentPassword || !this.newPassword) {
        message.warning('密码不能为空')
        return
      }
      if (this.newPassword.length < 8) {
        message.warning('新密码至少 8 位')
        return
      }
      if (this.newPassword !== this.confirmPassword) {
        message.warning('两次输入的新密码不一致')
        return
      }
      this.saving = true
      try {
        await changePassword(this.currentPassword, this.newPassword)
        message.success('密码已修改')
        this.reset()
        this.$emit('close')
      } catch (e) {
        message.error(getApiError(e, '修改失败'))
      } finally {
        this.saving = false
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.field {
  display: flex;
  align-items: center;
  margin: 16px 0;

  label {
    width: 88px;
    flex-shrink: 0;
    color: var(--text-2);
    font-size: 14px;
  }

  :deep(.ant-input-password) {
    flex: 1;
  }
}
</style>
