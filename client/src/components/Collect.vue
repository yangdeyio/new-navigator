<template>
  <div class="collect-page page-container">
    <div class="panel app-panel">
      <div class="composer">
        <div class="field">
          <a-input v-model:value="title" placeholder="文章标题（必填）" :maxlength="120" @keyup.enter="submit" />
        </div>
        <div class="field">
          <a-input v-model:value="href" placeholder="原文链接（必填，http/https）" :maxlength="2048" @keyup.enter="submit" />
        </div>
        <div class="field">
          <a-textarea v-model:value="note" :rows="2" placeholder="备注（可选）" :maxlength="500" />
        </div>
        <div class="composer-actions">
          <span class="me">以 {{ username }} 身份收藏</span>
          <a-button type="primary" :loading="posting" @click="submit">收藏</a-button>
        </div>
      </div>

      <a-spin :spinning="loading">
        <a-list
          :data-source="list"
          item-layout="vertical"
          :locale="{ emptyText: '还没有收藏，看到好文章先存下来' }"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta>
                <template #avatar>
                  <Favicon :href="item.href" />
                </template>
                <template #title>
                  <a :href="item.href" target="_blank" class="item-title" :class="{ read: item.is_read }">
                    {{ item.title }}
                  </a>
                </template>
                <template v-if="item.note" #description>{{ item.note }}</template>
              </a-list-item-meta>
              <div class="item-foot">
                <span class="time">{{ relativeTime(item.created_at) }}</span>
                <a-tag :color="item.is_read ? 'success' : 'warning'">
                  {{ item.is_read ? '已读' : '未读' }}
                </a-tag>
                <div class="ops">
                  <a-button size="small" @click="toggle(item)">
                    {{ item.is_read ? '标为未读' : '标为已读' }}
                  </a-button>
                  <a-popconfirm
                    title="确定删除该收藏？"
                    ok-text="删除"
                    cancel-text="取消"
                    @confirm="onDelete(item.id)"
                  >
                    <a-button size="small" danger>删除</a-button>
                  </a-popconfirm>
                </div>
              </div>
            </a-list-item>
          </template>
        </a-list>
      </a-spin>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import Favicon from './Favicon.vue'
import { message } from 'ant-design-vue'
import { store, loadCollections, addCollection, toggleCollection, removeCollection } from '../store'
import { relativeTime } from '../utils/format'
import { getApiError } from '../utils/api'
import type { Collection } from '../types'

export default defineComponent({
  name: 'Collect',
  components: { Favicon },
  data() {
    return {
      title: '',
      href: '',
      note: '',
      posting: false,
      loading: false
    }
  },
  computed: {
    username() {
      return (store.user && store.user.username) || ''
    },
    list() {
      return store.collections
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
        await loadCollections()
      } catch {
        message.error('收藏加载失败')
      } finally {
        this.loading = false
      }
    },
    async submit() {
      const title = this.title.trim()
      const href = this.href.trim()
      const note = this.note.trim()
      if (!title || !href) {
        message.warning('标题和链接不能为空')
        return
      }
      this.posting = true
      try {
        await addCollection({ href, title, note })
        this.title = ''
        this.href = ''
        this.note = ''
        message.success('已收藏')
      } catch (e) {
        message.error(getApiError(e, '收藏失败'))
      } finally {
        this.posting = false
      }
    },
    async toggle(item: Collection) {
      try {
        await toggleCollection(item.id, !item.is_read)
      } catch (e) {
        message.error(getApiError(e, '更新失败'))
      }
    },
    async onDelete(id: number) {
      try {
        await removeCollection(id)
        message.success('已删除')
      } catch (e) {
        message.error(getApiError(e, '删除失败'))
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.collect-page {
  padding-top: 36px;
}

.panel {
  padding: 24px;
}

.composer {
  margin-bottom: 20px;

  .field {
    margin-bottom: 12px;
  }

  .composer-actions {
    margin-top: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .me {
      color: var(--text-3);
      font-size: 13px;
    }
  }
}

.item-title {
  font-weight: 500;
  color: var(--text-1);

  &.read {
    color: var(--text-3);
    text-decoration: line-through;
  }
}

.item-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;

  .time {
    color: var(--text-3);
    font-size: 12px;
  }

  .ops {
    margin-left: auto;
    display: flex;
    gap: 8px;
  }
}
</style>
