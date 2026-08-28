<template>
  <div class="msg-page">
    <div class="panel">
      <div class="composer">
        <a-textarea
          v-model:value="content"
          :rows="3"
          :maxlength="1000"
          placeholder="说点什么…"
        />
        <div class="composer-actions">
          <span class="me">{{ username }}</span>
          <a-button type="primary" :loading="posting" @click="submit">发表</a-button>
        </div>
      </div>
      <a-spin :spinning="loading">
        <a-list
          :data-source="messages"
          item-layout="vertical"
          :locale="{ emptyText: '还没有留言，来抢沙发' }"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta>
                <template #avatar>
                  <a-avatar>{{ (item.username[0] || '?').toUpperCase() }}</a-avatar>
                </template>
                <template #title>{{ item.username }}</template>
                <template #description>{{ item.content }}</template>
              </a-list-item-meta>
              <div class="time">{{ relativeTime(item.created_at) }}</div>
            </a-list-item>
          </template>
        </a-list>
      </a-spin>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import { message } from 'ant-design-vue'
import { store } from '../store'
import { relativeTime } from '../utils/format'
import { getApiError } from '../utils/api'
import type { Message as MessageItem } from '../types'

export default defineComponent({
  name: 'Message',
  data() {
    return {
      content: '',
      posting: false,
      loading: false,
      messages: [] as MessageItem[]
    }
  },
  computed: {
    username() {
      return (store.user && store.user.username) || ''
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    relativeTime,
    async load() {
      this.loading = true
      try {
        const { data } = await axios.get<{ messages: MessageItem[] }>('/api/messages')
        this.messages = data.messages
      } catch {
        message.error('留言加载失败')
      } finally {
        this.loading = false
      }
    },
    async submit() {
      const content = this.content.trim()
      if (!content) {
        message.warning('内容不能为空')
        return
      }
      this.posting = true
      try {
        const { data } = await axios.post('/api/messages', { content })
        this.messages.unshift(data.message)
        this.content = ''
      } catch (e) {
        message.error(getApiError(e, '发表失败'))
      } finally {
        this.posting = false
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.msg-page {
  max-width: 640px;
  margin: 0 auto;
  padding-top: 60px;
}

.panel {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  padding: 20px;
}

.composer {
  margin-bottom: 20px;

  .composer-actions {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .me {
      color: rgba(0, 0, 0, 0.45);
      font-size: 13px;

      &::before {
        content: '以 ';
        color: rgba(0, 0, 0, 0.35);
      }

      &::after {
        content: ' 身份发表';
        color: rgba(0, 0, 0, 0.35);
      }
    }
  }
}

.time {
  color: rgba(0, 0, 0, 0.35);
  font-size: 12px;
}
</style>
