<template>
  <div class="hello">
    <div class="nav-panel">
      <Search class="search" />
      <a-spin :spinning="spinning" wrapper-class-name="bookmarks-spin">
        <SourceView @add="onAdd" @edit="onEdit" />
      </a-spin>
      <div v-if="bookmarksError" class="load-error">
        <span>书签加载失败</span>
        <a-button size="small" @click="retryLoad">重试</a-button>
      </div>
    </div>
    <div class="io-actions">
      <a-tooltip title="导出书签">
        <a-button @click="onExport"><ExportOutlined /></a-button>
      </a-tooltip>
      <a-tooltip title="导入书签">
        <a-button @click="pickFile"><ImportOutlined /></a-button>
      </a-tooltip>
      <input
        ref="fileInput"
        type="file"
        accept=".json,.html,.htm"
        style="display: none"
        @change="onImportFile"
      />
    </div>
    <div class="add-item-container" @click="onAdd()">
      <div class="add-item">
        <div class="add">
          <PlusOutlined />
        </div>
      </div>
    </div>
    <div v-show="visible" class="mask">
      <div class="edit">
        <div class="title">
          <span>{{ mode === 'add' ? '添加书签' : '编辑书签' }}</span>
        </div>
        <div class="format">
          <label>名称</label>
          <input v-model="name" type="text" @keyup.enter="confirm" />
        </div>
        <div class="format">
          <label>网址</label>
          <input v-model="ip" type="text" @keyup.enter="confirm" />
        </div>
        <div v-if="mode === 'add'" class="format">
          <label>分类</label>
          <select v-model="category" class="selected">
            <option v-for="c in categoryOptions" :key="c.source" :value="c.source">{{ c.label }}</option>
          </select>
        </div>
        <div class="buttons">
          <a-button type="primary" @click="confirm">确认</a-button>
          <a-button @click="cancel">取消</a-button>
        </div>
      </div>
    </div>
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

interface CategoryOption {
  source: BookmarkCategory
  label: string
}

export default defineComponent({
  name: 'HelloWorld',
  components: { Search, SourceView, PlusOutlined, ImportOutlined, ExportOutlined },
  data() {
    return {
      visible: false,
      mode: 'add' as 'add' | 'edit',
      category: 'document',
      editingId: null as number | null,
      name: '',
      ip: ''
    }
  },
  computed: {
    spinning() {
      return store.loadingBookmarks
    },
    bookmarksError() {
      return store.bookmarksError
    },
    categoryOptions(): CategoryOption[] {
      const legacy = LEGACY_CATEGORIES.map((c) => ({ source: c.key, label: c.label }))
      const legacyKeys = new Set(LEGACY_CATEGORIES.map((c) => c.key))
      const extra = orderedCategories(store.bookmarks)
        .filter((key) => !legacyKeys.has(key))
        .map((key) => ({ source: key, label: key }))
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
      this.ip = ''
      this.visible = true
    },
    onEdit({ category, item }: { category: BookmarkCategory; item: { id: number; href: string; value: string } }) {
      this.mode = 'edit'
      this.category = category
      this.editingId = item.id
      this.name = item.value
      this.ip = item.href
      this.visible = true
    },
    close() {
      this.visible = false
      this.name = ''
      this.ip = ''
      this.editingId = null
    },
    async confirm() {
      const name = this.name.trim()
      const href = this.ip.trim()
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
    cancel() {
      this.close()
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
  .hello {
    height: 100vh;
    padding: 36px 24px 36px;
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
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 24px 0 8px;
    box-sizing: border-box;

    .search {
      flex-shrink: 0;
      margin-bottom: 10px;
    }

    :deep(.bookmarks-spin) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
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

  .add-item-container {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 60px;
    height: 60px;

    .add-item {
      width: 100%;
      height: 100%;
      transform: translateX(70%);
      transition: all 0.5s;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &:hover {
        transform: translateX(0);
      }

      .add {
        border-radius: 50%;
        box-shadow: 0 5px 14px rgba(0, 0, 0, 0.2);
        width: 100%;
        height: 100%;
        background: #1890ff;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 30px;
        color: #ffffff;
        animation: add-transition infinite 1.5s;

        &:hover {
          animation: none;
          background: #4096ff;
        }
      }
    }
  }

  .io-actions {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10;
    display: flex;
    gap: 8px;

    :deep(.ant-btn) {
      border-radius: 8px;
      border-color: #e8e8e8;
      color: rgba(0, 0, 0, 0.65);
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      &:hover {
        color: #1890ff;
        border-color: #1890ff;
      }
    }
  }

  .mask {
    position: fixed;
    inset: 0;
    z-index: 20;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;

    .edit {
      width: 400px;
      max-width: 92vw;
      background: #ffffff;
      border-radius: 12px;
      padding: 20px 24px 24px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);

      .title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .format {
        display: flex;
        align-items: center;
        margin: 16px 0;

        label {
          width: 52px;
          flex-shrink: 0;
          color: rgba(0, 0, 0, 0.65);
          font-size: 14px;
        }

        input,
        .selected {
          flex: 1;
          border: 1px solid #d9d9d9;
          border-radius: 8px;
          height: 34px;
          padding: 0 10px;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.85);
          background: #fff;

          &:focus {
            outline: none;
            border-color: #1890ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15);
          }
        }
      }

      .buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 12px;
      }
    }
  }
}

@keyframes add-transition {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}
</style>
