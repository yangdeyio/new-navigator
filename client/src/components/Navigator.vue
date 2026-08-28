<template>
  <div class="navigator">
    <div class="nav-panel app-panel">
      <Search class="search" />
      <div class="panel-toolbar">
        <a-tooltip title="导出书签">
          <a-button type="text" @click="onExport"><ExportOutlined /></a-button>
        </a-tooltip>
        <a-tooltip title="导入书签">
          <a-button type="text" @click="pickFile"><ImportOutlined /></a-button>
        </a-tooltip>
        <a-button type="primary" @click="onAdd()">
          <PlusOutlined />
          <span>添加书签</span>
        </a-button>
      </div>
      <a-spin :spinning="spinning" wrapper-class-name="bookmarks-spin">
        <SourceView @add="onAdd" @edit="onEdit" />
      </a-spin>
      <div v-if="bookmarksError" class="load-error">
        <span>书签加载失败</span>
        <a-button size="small" @click="retryLoad">重试</a-button>
      </div>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept=".json,.html,.htm"
      style="display: none"
      @change="onImportFile"
    />
    <a-modal
      v-model:open="visible"
      :title="mode === 'add' ? '添加书签' : '编辑书签'"
      ok-text="确认"
      cancel-text="取消"
      :width="420"
      @ok="confirm"
    >
      <div class="form-field">
        <label>名称</label>
        <a-input v-model:value="name" placeholder="网站名称" @press-enter="confirm" />
      </div>
      <div class="form-field">
        <label>网址</label>
        <a-input v-model:value="url" placeholder="https://example.com" @press-enter="confirm" />
      </div>
      <div v-if="mode === 'add'" class="form-field">
        <label>分类</label>
        <a-select v-model:value="category" :options="selectOptions" show-search />
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Search from './Search.vue'
import SourceView from './Source.vue'
import { PlusOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { store, addBookmark, updateBookmark, loadBookmarks, importBookmarks } from '../store'
import { getApiError } from '../utils/api'
import { LEGACY_CATEGORIES, orderedCategories } from '../utils/categories'
import { parseBookmarksHtml, looksLikeBookmarksHtml } from '../utils/bookmarkHtml'
import type { BookmarkImportItem, BookmarkCategory } from '../types'

// 与后端 lib/bookmarks.ts 的 MAX_VALUE_LENGTH 一致
const MAX_VALUE_LENGTH = 120
// 与后端 import.ts 的 MAX_IMPORT 一致
const MAX_IMPORT = 2000

interface SelectOption {
  value: BookmarkCategory
  label: string
}

export default defineComponent({
  name: 'Navigator',
  components: { Search, SourceView, PlusOutlined, ImportOutlined, ExportOutlined },
  data() {
    return {
      visible: false,
      mode: 'add' as 'add' | 'edit',
      category: 'document' as BookmarkCategory,
      editingId: null as number | null,
      name: '',
      url: ''
    }
  },
  computed: {
    spinning() {
      return store.loadingBookmarks
    },
    bookmarksError() {
      return store.bookmarksError
    },
    selectOptions(): SelectOption[] {
      const legacy = LEGACY_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))
      const legacyKeys = new Set(LEGACY_CATEGORIES.map((c) => c.key))
      const extra = orderedCategories(store.bookmarks)
        .filter((key) => !legacyKeys.has(key))
        .map((key) => ({ value: key, label: key }))
      return [...legacy, ...extra]
    }
  },
  methods: {
    pickFile() {
      ;(this.$refs.fileInput as HTMLInputElement).click()
    },
    onAdd(category?: BookmarkCategory) {
      this.mode = 'add'
      this.category = category || 'document'
      this.editingId = null
      this.name = ''
      this.url = ''
      this.visible = true
    },
    onEdit({ category, item }: { category: BookmarkCategory; item: { id: number; href: string; value: string } }) {
      this.mode = 'edit'
      this.category = category
      this.editingId = item.id
      this.name = item.value
      this.url = item.href
      this.visible = true
    },
    close() {
      this.visible = false
      this.name = ''
      this.url = ''
      this.editingId = null
    },
    async confirm() {
      const name = this.name.trim()
      const href = this.url.trim()
      if (!name || !href) {
        message.warning('名称和网址不能为空')
        return
      }
      try {
        if (this.mode === 'add') {
          await addBookmark(this.category, href, name)
          message.success('已添加')
        } else {
          await updateBookmark(this.category, this.editingId!, { href, value: name })
          message.success('已保存')
        }
        this.close()
      } catch (e) {
        message.error(getApiError(e, '操作失败'))
      }
    },
    onExport() {
      const items = Object.entries(store.bookmarks).flatMap(([category, list]) =>
        list.map(({ href, value }) => ({ category, href, value }))
      )
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        bookmarks: items
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookmarks-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
    async onImportFile(e: Event) {
      const input = e.target as HTMLInputElement
      const file = input.files && input.files[0]
      input.value = ''
      if (!file) return
      let text
      try {
        text = await file.text()
      } catch {
        message.error('文件读取失败')
        return
      }

      let rawItems: BookmarkImportItem[]
      if (looksLikeBookmarksHtml(text)) {
        // 浏览器导出的 Netscape 书签 HTML：文件夹名即分类
        rawItems = parseBookmarksHtml(text)
      } else {
        try {
          const parsed = JSON.parse(text) as BookmarkImportItem[] | { bookmarks?: BookmarkImportItem[] }
          // 兼容导出格式 { bookmarks: [...] } 和纯数组格式
          rawItems = Array.isArray(parsed) ? parsed : parsed.bookmarks || []
        } catch {
          message.error('文件不是有效的书签文件（支持浏览器导出的 HTML 或本站导出的 JSON）')
          return
        }
      }
      if (!Array.isArray(rawItems) || rawItems.length === 0) {
        message.warning('文件里没有书签')
        return
      }

      // 预处理：跳过非 http(s) 链接，超长标题截断，按 href 去掉与现有书签及文件内部重复的项
      const existingHrefs = new Set(
        Object.values(store.bookmarks).flatMap((list) => list.map((item) => item.href))
      )
      const seen = new Set<string>()
      let skipped = 0
      const normalized: BookmarkImportItem[] = []
      for (const item of rawItems) {
        const href = String((item && item.href) || '').trim()
        const value = String((item && item.value) || '').trim()
        if (!/^https?:\/\//.test(href) || !value) {
          skipped++
          continue
        }
        if (existingHrefs.has(href) || seen.has(href)) {
          skipped++
          continue
        }
        seen.add(href)
        normalized.push({
          category: String((item && item.category) || '未分类').trim() || '未分类',
          href,
          value: value.slice(0, MAX_VALUE_LENGTH)
        })
      }
      if (normalized.length === 0) {
        message.warning('文件里没有可导入的新书签')
        return
      }
      let pending = normalized
      if (pending.length > MAX_IMPORT) {
        pending = pending.slice(0, MAX_IMPORT)
        skipped += normalized.length - MAX_IMPORT
      }

      const summary = skipped > 0 ? `（跳过 ${skipped} 条无效或重复）` : ''
      Modal.confirm({
        title: `将导入 ${pending.length} 条书签${summary}，是否继续？`,
        okText: '导入',
        cancelText: '取消',
        onOk: async () => {
          try {
            const imported = await importBookmarks(pending)
            message.success(`已导入 ${imported} 条`)
          } catch (err) {
            message.error(getApiError(err, '导入失败'))
          }
        }
      })
    },
    async retryLoad() {
      try {
        await loadBookmarks()
      } catch (e) {
        message.error(getApiError(e, '加载失败'))
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.navigator {
  height: calc(100vh - var(--header-h));
  padding: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;

  .nav-panel {
    width: 100%;
    max-width: 1120px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 24px 0 8px;
    box-sizing: border-box;

    .search {
      flex-shrink: 0;
      margin-bottom: 4px;
    }

    .panel-toolbar {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      padding: 0 24px 10px;

      :deep(.ant-btn-text) {
        color: var(--text-2);
      }
    }

    :deep(.bookmarks-spin) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 0 24px;
    }
    :deep(.bookmarks-spin .ant-spin-container) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .load-error {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: #ff4d4f;
      font-size: 14px;
      padding: 8px 0 12px;
    }
  }
}

// a-modal 会传送到 body,样式必须放在顶层,不能嵌套在 .navigator 下
.form-field {
  display: flex;
  align-items: center;
  margin: 16px 0;

  label {
    width: 52px;
    flex-shrink: 0;
    color: var(--text-2);
    font-size: 14px;
  }

  :deep(.ant-input),
  :deep(.ant-select) {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .navigator {
    padding: 12px;

    .panel-toolbar {
      padding: 0 16px 10px;
    }

    :deep(.bookmarks-spin) {
      padding: 0 16px;
    }
  }
}</style>
