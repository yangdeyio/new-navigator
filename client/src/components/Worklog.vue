<template>
  <div class="worklog-page">
    <div class="panel">
      <div class="composer">
        <a-textarea
          v-model:value="content"
          :rows="3"
          :maxlength="500"
          placeholder="记录今天的工作、想法或待办…"
        />
        <div class="composer-actions">
          <span class="hint">{{ content.length }}/500</span>
          <a-button type="primary" :loading="posting" @click="submit">记录</a-button>
        </div>
      </div>

      <div class="filter">
        <span class="count">共 {{ list.length }} 条</span>
      </div>

      <a-spin :spinning="loading">
        <a-list
          :data-source="list"
          :locale="{ emptyText: '还没有日志，先记录一条吧' }"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <div class="worklog-item" :class="{ done: item.is_done }">
                <a-checkbox :checked="!!item.is_done" @change="toggle(item)" />
                <div class="content">
                  <div class="text">{{ item.content }}</div>
                  <div class="time">{{ relativeTime(item.created_at) }}</div>
                </div>
                <a-popconfirm
                  title="确定删除该日志？"
                  ok-text="删除"
                  cancel-text="取消"
                  @confirm="onDelete(item.id)"
                >
                  <a-button size="small" type="text" danger class="del">
                    <DeleteOutlined />
                  </a-button>
                </a-popconfirm>
              </div>
            </a-list-item>
          </template>
        </a-list>
      </a-spin>
    </div>
  </div>
</template>
<script>
import { DeleteOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { store, loadWorklogs, addWorklog, toggleWorklog, removeWorklog } from '../store'
import { relativeTime } from '../utils/format'
import { getApiError } from '../utils/api'

export default {
  name: 'Worklog',
  components: { DeleteOutlined },
  data() {
    return {
      content: '',
      posting: false,
      loading: false
    }
  },
  computed: {
    list() {
      return store.worklogs
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
        await loadWorklogs()
      } catch {
        message.error('日志加载失败')
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
        await addWorklog(content)
        this.content = ''
        message.success('已记录')
      } catch (e) {
        message.error(getApiError(e, '记录失败'))
      } finally {
        this.posting = false
      }
    },
    async toggle(item) {
      try {
        await toggleWorklog(item.id, !item.is_done)
      } catch (e) {
        message.error(getApiError(e, '更新失败'))
      }
    },
    async onDelete(id) {
      try {
        await removeWorklog(id)
        message.success('已删除')
      } catch (e) {
        message.error(getApiError(e, '删除失败'))
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.worklog-page {
  max-width: 720px;
  margin: 0 auto;
  padding-top: 48px;
  box-sizing: border-box;
}

.panel {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 12px;
  padding: 24px;
}

.composer {
  margin-bottom: 8px;

  .composer-actions {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .hint {
      color: rgba(0, 0, 0, 0.35);
      font-size: 13px;
    }
  }
}

.filter {
  margin: 8px 0 4px;

  .count {
    color: rgba(0, 0, 0, 0.45);
    font-size: 13px;
  }
}

.worklog-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;

  .content {
    flex: 1;

    .text {
      color: rgba(0, 0, 0, 0.85);
      white-space: pre-wrap;
      word-break: break-word;
    }

    .time {
      margin-top: 4px;
      color: rgba(0, 0, 0, 0.35);
      font-size: 12px;
    }
  }

  .del {
    flex-shrink: 0;
    color: rgba(0, 0, 0, 0.35);

    &:hover {
      color: #ff4d4f;
    }
  }

  &.done {
    .text {
      color: rgba(0, 0, 0, 0.4);
      text-decoration: line-through;
    }
  }
}
</style>
