<template>
  <div id="wrapper">
    <div class="change">
      <span :class="{'active': isBing}" @click="doBing">Bing</span>
      <span :class="{'active': isGoogle}" @click="doGoogle">Google</span>
    </div>
    <div class="search-wrapper">
      <input v-model="value" type="text" @keypress.enter="search"/>
      <div class="search-button" @click="search">
        <SearchOutlined style="fontSize: 24px;" class="search-icon"/>
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
      isBing: false,
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
    }else{
      window.open(`https://cn.bing.com/search?q=${query}`)
    }
  },
    doBing(){
      this.isBing = true
      this.isGoogle = false
    },
    doGoogle(){
      this.isBing = false
      this.isGoogle = true
    }
  }
})
</script>
<style lang="scss" scoped>
#wrapper{
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  .change{
    display: inline-flex;
    gap: 8px;
    align-self: flex-start;
    margin-bottom: 12px;
    span{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 76px;
      height: 38px;
      padding: 0 18px;
      border-radius: 19px;
      font-size: 15px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(255, 255, 255, 0.16);
      backdrop-filter: blur(6px);
      cursor: pointer;
      transition: background 0.25s, color 0.25s, box-shadow 0.25s;
      &:hover{
        background: rgba(255, 255, 255, 0.28);
      }
      &.active{
        color: #ffffff;
        background: #1890ff;
        box-shadow: 0 4px 14px rgba(24, 144, 255, 0.4);
      }
    }
  }
  .search-wrapper{
    display: flex;
    align-items: center;
    padding: 4px 8px;
    background: #efefef;
    border-radius: 12px;
    width: 640px;
    max-width: 92vw;
    box-sizing: border-box;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    input{
      height: 42px;
      flex: 1;
      min-width: 0;
      padding: 8px;
      font-size: 14px;
      background: #efefef;
    }
    .search-button{
      cursor: pointer;
      .search-icon{
        &:hover{
          transform: scale(1.2);
        }
      }
    }
  }
}
</style>