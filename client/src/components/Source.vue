<template>
  <div class="sourceWrapper">
    <div class="cat-bar">
      <a-segmented v-model:value="activeKey" :options="segmentedOptions" class="cat-seg" />
    </div>
    <div class="wrapper">
      <ul>
        <li class="add-cell" :title="`添加到${activeLabel}`" @click="$emit('add', activeKey)">
          <PlusOutlined class="add-plus" />
          <span class="add-label">添加</span>
        </li>
        <a
          v-for="item in list[activeKey]"
          :key="item.id"
          :href="item.href"
          target="_blank"
          v-bind="anchorAttrs(item.href)"
        >
          <Favicon :href="item.href" :size="32" class="card-icon" />
          <div class="value-text">{{ item.value }}</div>
          <div class="ops" @click.stop.prevent>
            <EditOutlined class="op edit" title="编辑" @click="$emit('edit', { category: activeKey, item })" />
            <a-popconfirm
              title="确定删除该书签？"
              ok-text="删除"
              cancel-text="取消"
              @confirm="onDelete(activeKey, item.id)"
            >
              <CloseOutlined class="op del" title="删除" />
            </a-popconfirm>
          </div>
        </a>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, h, type Component } from 'vue'
import Favicon from './Favicon.vue'
import {
  ExperimentOutlined,
  SwitcherOutlined,
  RocketOutlined,
  VideoCameraOutlined,
  ThunderboltOutlined,
  FolderOutlined,
  PlusOutlined,
  CloseOutlined,
  EditOutlined
} from '@ant-design/icons-vue'
import { store, removeBookmark } from '../store'
import { message } from 'ant-design-vue'
import { getApiError } from '../utils/api'
import { categoryLabel, orderedCategories } from '../utils/categories'
import type { BookmarkCategory } from '../types'

interface TabDef {
  source: BookmarkCategory
  label: string
  icon: Component
}

const LEGACY_ICONS: Partial<Record<BookmarkCategory, Component>> = {
  document: ExperimentOutlined,
  blog: SwitcherOutlined,
  design: RocketOutlined,
  video: VideoCameraOutlined,
  entertainment: ThunderboltOutlined
}

export default defineComponent({
  components: {
    Favicon,
    PlusOutlined,
    CloseOutlined,
    EditOutlined
  },
  emits: ['add', 'edit'],
  data() {
    return {
      activeKey: 'document' as BookmarkCategory
    }
  },
  computed: {
    list() {
      return store.bookmarks
    },
    tabs(): TabDef[] {
      return orderedCategories(store.bookmarks).map((key) => ({
        source: key,
        label: categoryLabel(key),
        icon: LEGACY_ICONS[key] || FolderOutlined
      }))
    },
    activeLabel(): string {
      const tab = this.tabs.find((t) => t.source === this.activeKey)
      return tab ? tab.label : this.activeKey
    },
    segmentedOptions() {
      // label 传 VNode,让分类项带图标
      return this.tabs.map((t) => ({
        value: t.source,
        label: h('span', { class: 'seg-item' }, [h(t.icon), h('span', { class: 'seg-text' }, t.label)])
      }))
    }
  },
  watch: {
    // 当前选中的分类被删空后仍保留 key；这里保证 activeKey 始终指向存在的分类
    tabs: {
      immediate: true,
      handler(tabs: TabDef[]) {
        if (!tabs.some((t) => t.source === this.activeKey) && tabs.length > 0) {
          this.activeKey = tabs[0].source
        }
      }
    }
  },
  methods: {
    anchorAttrs(href: string): Record<string, string> {
      // 非 http(s) 链接不作外链跳转
      return /^https?:\/\//.test(href) ? {} : { onclick: 'return false' }
    },
    async onDelete(category: BookmarkCategory, id: number) {
      try {
        await removeBookmark(category, id)
        message.success('已删除')
      } catch (e) {
        message.error(getApiError(e, '删除失败'))
      }
    }
  }
})
</script>
<style lang="scss" scoped>
a {
  text-decoration: none;
}
.sourceWrapper {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .cat-bar {
    flex-shrink: 0;
    margin-bottom: 14px;
    overflow-x: auto;
    padding-bottom: 2px;

    :deep(.cat-seg.ant-segmented) {
      max-width: 100%;
      overflow-x: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    :deep(.seg-item) {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 4px;
    }
  }

  .wrapper {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 4px 2px 16px;

    ul {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
      padding: 0;
      margin: 0;
      list-style: none;

      a {
        position: relative;
        min-height: 92px;
        background: var(--surface-2);
        border: 1px solid var(--surface-2-border);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 10px 12px;
        cursor: pointer;
        box-sizing: border-box;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

        .card-icon {
          margin-right: 0;
        }

        .value-text {
          max-width: 100%;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-1);
          line-height: 18px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          padding: 0 4px;
        }

        .ops {
          position: absolute;
          right: 6px;
          top: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;

          .op {
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-size: 12px;
            color: var(--text-3);
            cursor: pointer;
            background: var(--surface-2-hover);
            transition: color 0.2s ease, background 0.2s ease;

            &.edit:hover {
              color: var(--accent);
              background: var(--accent-weak);
            }
            &.del:hover {
              color: #ff4d4f;
              background: rgba(255, 77, 79, 0.12);
            }
          }
        }

        &:hover {
          border-color: var(--accent);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);

          .ops {
            opacity: 1;
            pointer-events: auto;
          }
        }
      }

      .add-cell {
        min-height: 92px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--text-3);
        background: transparent;
        border: 1px dashed var(--surface-2-border);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-sizing: border-box;

        .add-plus {
          font-size: 18px;
        }
        .add-label {
          font-size: 13px;
          font-weight: 500;
        }

        &:hover {
          color: var(--accent);
          border-color: var(--accent);
          border-style: solid;
          background: var(--accent-weak);
        }
      }
    }
  }
}
</style>
