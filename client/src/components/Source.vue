<template>
  <div class="sourceWrapper">
    <a-tabs v-model:active-key="activeKey">
      <a-tab-pane v-for="vo in itemList" :key="vo.source">
        <template #tab>
          <span>
            <component :is="vo.icon" />
            {{ vo.label }}
          </span>
        </template>
        <div class="wrapper">
          <ul>
            <li class="add-cell" :title="`添加到${vo.label}`" @click="$emit('add', activeKey)">
              <PlusCircleOutlined />
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
              <div class="ops" @click.stop>
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
<script>
import Favicon from './Favicon.vue'
import {
  ExperimentOutlined,
  SwitcherOutlined,
  RocketOutlined,
  VideoCameraOutlined,
  ThunderboltOutlined,
  PlusCircleOutlined,
  CloseOutlined,
  EditOutlined
} from '@ant-design/icons-vue'
import { store, removeBookmark } from '../store'
import { message } from 'ant-design-vue'

export default {
  components: {
    Favicon,
    PlusCircleOutlined,
    CloseOutlined,
    EditOutlined
  },
  emits: ['add', 'edit'],
  data() {
    return {
      activeKey: 'document',
      itemList: [
        { label: '技术文档', source: 'document', icon: ExperimentOutlined },
        { label: '技术博客', source: 'blog', icon: SwitcherOutlined },
        { label: '设计', source: 'design', icon: RocketOutlined },
        { label: '视频学习', source: 'video', icon: VideoCameraOutlined },
        { label: '娱乐', source: 'entertainment', icon: ThunderboltOutlined }
      ]
    }
  },
  computed: {
    list() {
      return store.bookmarks
    }
  },
  methods: {
    anchorAttrs(href) {
      // 非 http(s) 链接不作外链跳转
      return /^https?:\/\//.test(href) ? {} : { onclick: 'return false' }
    },
    async onDelete(category, id) {
      await removeBookmark(category, id)
      message.success('已删除')
    }
  }
}
</script>
<style lang="scss" scoped>
a {
  text-decoration: none;
}
.sourceWrapper {
  position: relative;
  width: 680px;
  max-width: 96vw;
  margin: 0 auto;
  border-radius: 8px;
  margin-top: 30px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .wrapper {
    ul {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      li,
      a {
        width: 120px;
        min-height: 36px;
        background: rgba(255, 255, 255, 0.72);
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 0 8px;
        margin: 4px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        color: rgba(0, 0, 0, 0.72);
        position: relative;
        overflow: hidden;

        .value-text {
          line-height: 30px;
          max-width: 78px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .ops {
          display: none;
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.92);
          align-items: center;
          justify-content: center;
          gap: 10px;

          .op {
            font-size: 15px;
            color: rgba(0, 0, 0, 0.45);
            cursor: pointer;
            padding: 2px;

            &.edit:hover {
              color: #1890ff;
            }
            &.del:hover {
              color: #ff4d4f;
            }
          }
        }

        &:hover {
          background: #ffffff;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);

          .ops {
            display: flex;
          }
        }
      }

      .add-cell {
        justify-content: center;
        font-size: 20px;
        color: rgba(0, 0, 0, 0.35);
        background: rgba(255, 255, 255, 0.4);

        &:hover {
          color: #1890ff;
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
  }
  :deep(.ant-tabs-content-holder) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
  :deep(.ant-tabs-nav-scroll) {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  :deep(.ant-tabs-tab) {
    font-weight: 500;
    color: #ffffff;
    font-size: 14px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  }
}
</style>
