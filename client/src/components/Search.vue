<template>
  <div id="wrapper">
    <div class="change">
      <span :class="{'active': isBing}" @click="doBing">Bing</span>
      <span :class="{'active': isBaidu}" @click="doBaidu">百度</span>
      <span :class="{'active': isGoogle}" @click="doGoogle">Google</span>
    </div>
    <div class="search-wrapper">
      <input v-model="value" type="text" placeholder="搜索，或输入网址回车打开…" @keypress.enter="search"/>
      <div class="search-button" @click="search">
        <SearchOutlined style="fontSize: 20px;" class="search-icon"/>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  components: {
    SearchOutlined
  },
  data(){
    return {
      value: '',
      isBing: true,
      isBaidu: false,
      isGoogle: false
    }
  },
  mounted(){
    this.doBing()
  },
  methods: {
  search(){
    const q = this.value.trim()
    if(!q) return
    const query = encodeURIComponent(q)
    if(this.isGoogle){
      window.open(`https://www.google.com/search?q=${query}`)
    }else if(this.isBaidu){
      window.open(`https://www.baidu.com/s?wd=${query}`)
    }else{
      window.open(`https://cn.bing.com/search?q=${query}`)
    }
  },
    doBing(){
      this.isBing = true
      this.isBaidu = false
      this.isGoogle = false
    },
    doBaidu(){
      this.isBing = false
      this.isBaidu = true
      this.isGoogle = false
    },
    doGoogle(){
      this.isBing = false
      this.isBaidu = false
      this.isGoogle = true
    }
  }
})
</script>
<style lang="scss" scoped>
#wrapper{
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  gap: 14px;

  .change{
    display: inline-flex;
    gap: 12px;
    span{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 64px;
      height: 32px;
      padding: 0 16px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.55);
      background: #f5f6f8;
      border: 1px solid #e8e8e8;
      cursor: pointer;
      transition: background 0.25s, color 0.25s, border-color 0.25s, box-shadow 0.25s;
      &:hover{
        color: #1890ff;
        border-color: #1890ff;
      }
      &.active{
        color: #ffffff;
        background: #1890ff;
        border-color: #1890ff;
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
      }
    }
  }

  .search-wrapper{
    display: flex;
    align-items: center;
    padding: 0 6px 0 20px;
    background: #ffffff;
    border: 1px solid #e8e8e8;
    border-radius: 999px;
    width: min(560px, 92%);
    box-sizing: border-box;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus-within {
      border-color: #1890ff;
      box-shadow: 0 4px 16px rgba(24, 144, 255, 0.14);
    }

    input{
      height: 44px;
      flex: 1;
      min-width: 0;
      padding: 8px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      &::placeholder {
        color: rgba(0, 0, 0, 0.3);
      }
    }
    .search-button{
      cursor: pointer;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #1890ff;
      color: #ffffff;
      flex-shrink: 0;
      transition: background 0.2s ease, transform 0.15s ease;

      .search-icon {
        &:hover {
          transform: scale(1.05);
        }
      }

      &:hover {
        background: #4096ff;
      }
    }
  }
}
</style>