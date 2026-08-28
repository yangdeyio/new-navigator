<template>
  <div class="sourceWrapper">
    <a-tabs v-model:active-key="activeKey">
      <a-tab-pane v-for="vo in tabs" :key="vo.source">
        <template #tab>
          <span>
            <component :is="vo.icon" />
            {{ vo.label }}
          </span>
        </template>
        <div class="wrapper">
          <ul>
            <li class="add-cell" :title="`添加到${vo.label}`" @click="$emit('add', vo.source)">
              <PlusOutlined class="add-plus" />
              <span class="add-label">添加</span>
            </li>
            <a
              v-for="item in list[vo.source]"
              :key="item.id"
              :href="item.href"
              target="_blank"
              v-bind="anchorAttrs(item.href)"
            >
              <Favicon :href="item.href" />
              <div class="value-text">{{ item.value }}</div>
              <div class="ops" @click.stop.prevent>
                <EditOutlined class="op edit" title="编辑" @click="$emit('edit', { category: vo.source, item })" />
                <a-popconfirm
                  title="确定删除该书签？"
                  ok-text="删除"
                  cancel-text="取消"
                  @confirm="onDelete(vo.source, item.id)"
                >
                  <CloseOutlined class="op del" title="删除" />
                </a-popconfirm>
              </div>
            </a>
          </ul>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script lang="ts">
import { defineComponent, type Component } from 'vue'
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
import { LEGACY_CATEGORIES, categoryLabel, orderedCategories } from '../utils/categories'
import type { BookmarkCategory } from '../types'

interface TabDef {
  source: BookmarkCategory
  label: string
  icon: Component
}

const LEGACY_ICONS = Object.fromEntries(
  LEGACY_CATEGORIES.map((c) => [
    c.key,
    {
      document: ExperimentOutlined,
      blog: SwitcherOutlined,
      design: RocketOutlined,
      video: VideoCameraOutlined,
      entertainment: ThunderboltOutlined
    }[c.key]
  ])
)

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
      activeKey: 'document'
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
  max-width: 1120px;
  padding: 0 24px;
  box-sizing: border-box;
  margin: 0 auto;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .wrapper {
    ul {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
      a {
        min-height: 46px;
        background: #ffffff;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 0 42px 0 10px;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: rgba(0, 0, 0, 0.72);
        position: relative;
        border: 1px solid #ececec;
        box-sizing: border-box;

        .value-text {
          flex: 1;
          min-width: 0;
          line-height: 30px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .ops {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;

          .op {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.45);
            cursor: pointer;
            background: rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(0, 0, 0, 0.06);
            transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;

            &.edit:hover {
              color: #1890ff;
              background: rgba(24, 144, 255, 0.12);
              border-color: rgba(24, 144, 255, 0.3);
            }
            &.del:hover {
              color: #ff4d4f;
              background: rgba(255, 77, 79, 0.12);
              border-color: rgba(255, 77, 79, 0.3);
            }
          }
        }

        &:hover {
          border-color: #1890ff;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.12);
          transform: translateY(-1px);

          .ops {
            opacity: 1;
            pointer-events: auto;
          }
        }
      }

      .add-cell {
        min-height: 46px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: rgba(0, 0, 0, 0.4);
        background: #f7f8fa;
        border: 1px dashed #d9d9d9;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-sizing: border-box;

        .add-plus {
          font-size: 16px;
        }
        .add-label {
          font-size: 13px;
          font-weight: 500;
        }

        &:hover {
          color: #1890ff;
          border-color: #1890ff;
          border-style: solid;
          background: rgba(24, 144, 255, 0.06);
        }
      }
    }
  }

  :deep(.ant-tabs) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  :deep(.ant-tabs-nav) {
    flex-shrink: 0;
    margin-bottom: 12px;
  }
  :deep(.ant-tabs-content-holder) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0;
  }
  :deep(.ant-tabs-content) {
    padding: 6px 0 0;
  }
  // 卡片网格第一行悬浮上移时，预留顶部空间，避免被滚动容器裁切上边框
  .wrapper {
    padding-top: 4px;
  }
  :deep(.ant-tabs-nav-scroll) {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  :deep(.ant-tabs-tab) {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
  }
  :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
    color: #1890ff;
  }
}
</style>
