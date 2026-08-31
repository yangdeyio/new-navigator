<template>
  <div id="wrapper">
    <div class="change">
      <span
        v-for="e in engines"
        :key="e.key"
        :class="{ active: engine === e.key }"
        @click="engine = e.key"
      >{{ e.label }}</span>
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

type EngineKey = 'bing' | 'baidu' | 'google'

const ENGINE_URLS: Record<EngineKey, (q: string) => string> = {
  bing: (q) => `https://cn.bing.com/search?q=${q}`,
  baidu: (q) => `https://www.baidu.com/s?wd=${q}`,
  google: (q) => `https://www.google.com/search?q=${q}`
}

export default defineComponent({
  components: {
    SearchOutlined
  },
  data(){
    return {
      value: '',
      engine: 'bing' as EngineKey,
      engines: [
        { key: 'bing', label: 'Bing' },
        { key: 'baidu', label: '百度' },
        { key: 'google', label: 'Google' }
      ] as { key: EngineKey; label: string }[]
    }
  },
  methods: {
    search(){
      const q = this.value.trim()
      if(!q) return
      // 看起来像网址(无空格、域名形如 xx.yy[/path])就直达,兑现占位符的承诺
      if (/^(https?:\/\/)?[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/i.test(q)) {
        window.open(/^https?:\/\//i.test(q) ? q : `https://${q}`)
        return
      }
      const query = encodeURIComponent(q)
      window.open(ENGINE_URLS[this.engine](query))
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
  padding-top: 8px;

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
      color: var(--text-2);
      background: var(--surface-2);
      border: 1px solid var(--surface-2-border);
      cursor: pointer;
      transition: background 0.25s, color 0.25s, border-color 0.25s, box-shadow 0.25s;
      &:hover{
        color: var(--accent);
        border-color: var(--accent);
      }
      &.active{
        color: #ffffff;
        background: var(--accent);
        border-color: var(--accent);
        box-shadow: 0 4px 12px var(--accent-weak);
      }
    }
  }

  .search-wrapper{
    display: flex;
    align-items: center;
    padding: 0 6px 0 20px;
    background: var(--surface-2);
    border: 1px solid var(--surface-2-border);
    border-radius: 999px;
    width: min(560px, 92%);
    box-sizing: border-box;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus-within {
      border-color: var(--accent);
      box-shadow: 0 4px 16px var(--accent-weak);
    }

    input{
      height: 44px;
      flex: 1;
      min-width: 0;
      padding: 8px;
      font-size: 14px;
      color: var(--text-1);
      background: transparent;
      border: none;
      outline: none;
      &::placeholder {
        color: var(--text-3);
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
      background: var(--accent);
      color: #ffffff;
      flex-shrink: 0;
      transition: background 0.2s ease, transform 0.15s ease;

      .search-icon {
        &:hover {
          transform: scale(1.05);
        }
      }

      &:hover {
        background: var(--accent-hover);
      }
    }
  }
}
</style>
