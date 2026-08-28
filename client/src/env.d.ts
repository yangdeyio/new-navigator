/// <reference types="vite/client" />

// 供 plain tsserver 使用；vue-tsc 原生解析 .vue，此声明仅作编辑器兜底
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
