/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */
// ant-design-vue 4 全局注册组件的模板类型支持（main.js 中 app.component 注册的 a-* 组件）
import type { GlobalComponents } from 'ant-design-vue/typings/global'

declare module 'vue' {
  export interface GlobalComponents extends GlobalComponents {}
}
