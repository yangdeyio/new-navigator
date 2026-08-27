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
            <li data-remind="document" @click="changeVisible">
              <PlusCircleOutlined />
            </li>
            <a
              v-for="item in list[vo.source]"
              :key="item.id"
              :href="item.href"
              target="_blank"
            >
              <Favicon :href="item.href"/>
              <div class="value-text">{{ item.value }}</div>
              <a-popconfirm
                title="确定删除该书签？"
                ok-text="删除"
                cancel-text="取消"
                @confirm="onDelete(vo.source, item.id)"
              >
                <CloseOutlined class="del" @click.stop />
              </a-popconfirm>
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
  CloseOutlined
} from '@ant-design/icons-vue'
import { store, removeBookmark } from '../store'

export default {
  components: {
    Favicon,
    PlusCircleOutlined,
    CloseOutlined
  },
  emits: ['visible'],
  data() {
    return {
      activeKey: 'document',
      list: store.bookmarks,
      itemList: [
        {
          label: '技术文档',
          source: 'document',
          icon: ExperimentOutlined,
        },
        {
          label: '技术博客',
          source: 'blog',
          icon: SwitcherOutlined,
        },
        {
          label: '设计',
          source: 'design',
          icon: RocketOutlined,
        },
        {
          label: '视频学习',
          source: 'video',
          icon: VideoCameraOutlined,
        },
        {
          label: '娱乐',
          source: 'entertainment',
          icon: ThunderboltOutlined,
        },
      ],
    }
  },
  methods: {
    changeVisible(e) {
      let keyword = e.target.getAttribute('data-remind')
      this.$emit('visible', keyword)
    },
    onDelete(category, id) {
      removeBookmark(category, id)
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
  width: 640px;
  margin: 0 auto;
  border-radius: 4px;
  margin-top: 30px;
  .wrapper {
    ul {
      width: 100%;
      overflow-y: auto;
      display: flex;
      flex-wrap: wrap;
      li,
      a {
        width: 120px;
        height: 36px;
        background: rgba(245, 246, 241, 0.7);
        font-weight: 500;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 4px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.5s;
        color: rgba(0, 0, 0, 0.65);
        position: relative;

        .value-text {
          line-height: 30px;
          max-width: 80px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .del {
          display: none;
          position: absolute;
          top: 1px;
          right: 3px;
          font-size: 12px;
          color: rgba(0, 0, 0, 0.35);

          &:hover {
            color: #ff4d4f;
          }
        }

        &:hover {
          background: #ffffff;

          .del {
            display: block;
          }
        }
      }
    }
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
  }
}
</style>
