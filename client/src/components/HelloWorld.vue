<template>
  <div class="hello">
    <div class="add-item-container" @click="onAdd()">
      <div class="add-item">
        <div class="add">
          <PlusOutlined />
        </div>
      </div>
    </div>
    <Search class="search" />
    <SourceView @add="onAdd" @edit="onEdit" />
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
            <option v-for="c in categories" :key="c.source" :value="c.source">{{ c.label }}</option>
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

<script>
import Search from './Search.vue'
import SourceView from './Source.vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { addBookmark, updateBookmark } from '../store'

const CATEGORIES = [
  { label: '技术文档', source: 'document' },
  { label: '技术博客', source: 'blog' },
  { label: '设计', source: 'design' },
  { label: '视频学习', source: 'video' },
  { label: '娱乐', source: 'entertainment' }
]

export default {
  name: 'HelloWorld',
  components: { Search, SourceView, PlusOutlined },
  data() {
    return {
      categories: CATEGORIES,
      visible: false,
      mode: 'add',
      category: 'document',
      editingId: null,
      name: '',
      ip: ''
    }
  },
  methods: {
    onAdd(category) {
      this.mode = 'add'
      this.category = category || 'document'
      this.editingId = null
      this.name = ''
      this.ip = ''
      this.visible = true
    },
    onEdit({ category, item }) {
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
          await updateBookmark(this.category, this.editingId, { href, value: name })
          message.success('已保存')
        }
        this.close()
      } catch (e) {
        message.error((e.response && e.response.data && e.response.data.error) || '操作失败')
      }
    },
    cancel() {
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
.hello {
  padding-top: 100px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

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
        background: rgba(255, 255, 255, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 30px;
        color: #1890ff;
        animation: add-transition infinite 1.5s;

        &:hover {
          animation: none;
          color: #4096ff;
        }
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
      border-radius: 16px;
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
          border-radius: 6px;
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
