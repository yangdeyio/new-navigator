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
              v-for="(item,index) in list[vo.source]"
              :key="index"
              :href="item.href"
              target="_blank"
            >
              <Favicon :href="item.href"/>
              <div class="value-text">{{ item.value }}</div>
            </a>
          </ul>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
import Favicon from './Favicon.vue'
import X from '../Data/source'
import {
  ExperimentOutlined,
  SwitcherOutlined,
  RocketOutlined,
  VideoCameraOutlined,
  ThunderboltOutlined,
  PlusCircleOutlined
} from '@ant-design/icons-vue'

export default {
  components: {
    Favicon,
    PlusCircleOutlined
  },
  emits: ['visible'],
  data() {
    return {
      activeKey: 'document',
      list: X,
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
        .value-text {
          line-height: 30px;
          max-width: 80px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        &:hover {
          background: #ffffff;
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
