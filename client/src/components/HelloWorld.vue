<template>
  <div class="hello">
    <div class="add-item-container">
      <div class="add-item">
        <div class="add">
          <PlusOutlined />
        </div>
      </div>
    </div>
      <Search class="search"/>
      <SourceView @visible="change" />
      <div class="mask" :style="{display: `${visible ? 'block' : 'none'}`}">
        <div class="edit">
          <div class="title"><span>请编辑需要加入的网站</span></div>
          <div class="format">名称：<input v-model="name" type="text"></div>
          <div class="format">网址：<input v-model="ip" type="text"></div>
          <div class="buttons">
            <a-button @click="confirm">确认</a-button>
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
export default {
  name: 'HelloWorld',
  components: {
    Search,
    SourceView,
    PlusOutlined
  },
  data(){
    return {
      visible: false,
      keyword: null,
      name: '',
      ip: ''
    }
  },
  methods: {
    change(e){
      this.keyword = e
      this.visible = true
    },
    close(){
      this.visible = false
    },
    confirm(){
      this.close()
      let source = JSON.parse(localStorage.getItem('all-source'));
      let arr = [{"href": this.ip,"value": this.name}];
      source[this.keyword].unshift(...arr);
    },
    cancel(){
      this.close()
    },
    getKey(e){
      this.key = e.key
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.hello{
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
        box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 30px;
        color: #333;
        animation: add-transition infinite 1.5s;
        &:hover {
          animation: none
        }
      }
    }
  }
  .mask{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background: rgba(0,0,0,0.5);
    .edit{
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%,-50%);
      height: 200px;
      width: 400px;
      background: #ffffff;
      border-radius: 16px;
      .title{
        margin: 16px;
        font-size: 16px;
        font-weight: 500;
      }
      .format{
        margin: 20px 0 10px 16px;
        input{
          border: 1px solid #cccccc;
          border-radius: 4px;
          width: 320px;
          height: 32px;
          padding-left: 8px;
        }
      }
      .buttons{
        display: flex;
        justify-content: flex-end;
        margin-right: 22px;
        button{
          margin-left: 8px;
          &:first-child{
            background: #1890FF;
            color: #ffffff;
          }
        }
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
