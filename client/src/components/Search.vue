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
<script>
import { SearchOutlined } from '@ant-design/icons-vue'

export default {
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
      if(this.isGoogle){
        window.open(`https://www.google.com/search?q=${this.value}`)
      }else{
        window.open(`https://cn.bing.com/search?q=${this.value}`)
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
};
</script>
<style lang="scss" scoped>
#wrapper{
  display: flex;
  flex-direction: column;
  .change{
    align-self: flex-start;
    text-align: center;
    margin-bottom: -1px;
    span{
      display: inline-block;
      width: 80px;
      height: 42px;
      font-size: 18px;
      line-height: 42px;
      background: #cccccc;
      position: relative;
      color: #1F1F1F;
      cursor: pointer;
      opacity: 0.8;
      border-top-left-radius: 8px;
      &:first-child{
        margin-right: 8px;
      }
      &::after{
        content: '';
        display: block;
        border-width: 21px;
        border-style: solid;
        border-color: transparent transparent #cccccc #cccccc;
        position: absolute;
        top: 0;
        right: 0;
        transform: translateX(100%);
        z-index: 10;
      }
      &.active{
        background: #efefef;
        z-index: 10;
        opacity: 1;
        color: #4285F4;
        &::after{
          border-color: transparent transparent #efefef #efefef;
        }
      }
    }
  }
  .search-wrapper{
    //border: 1px solid #cccccc;
    display: flex;
    align-items: center;
    padding: 4px 8px;
    background: #efefef;
    border-radius: 0 8px 8px 8px;
    width: 640px;
    &.active{
      //border: 1px solid #232323;
    }
    input{
      height: 42px;
      width: 600px;
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