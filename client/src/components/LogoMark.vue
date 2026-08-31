<template>
  <!-- 「一览」图形标:圆角窗口内排布 4 块书签瓦片,一块最亮,寓意"一眼总览" -->
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :aria-label="label"
    role="img"
  >
    <defs>
      <linearGradient id="logo-grad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
        <stop stop-color="#7d8bff" />
        <stop offset="1" stop-color="#4353e9" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="42" height="42" rx="13" fill="url(#logo-grad)" />
    <rect x="11" y="11" width="12" height="12" rx="3.5" fill="#ffffff" fill-opacity="0.95" />
    <rect x="25" y="11" width="12" height="12" rx="3.5" fill="#ffffff" fill-opacity="0.5" />
    <rect x="11" y="25" width="12" height="12" rx="3.5" fill="#ffffff" fill-opacity="0.55" />
    <rect x="25" y="25" width="12" height="12" rx="3.5" fill="#ffffff" fill-opacity="0.8" />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LogoMark',
  props: {
    size: { type: Number, default: 28 },
    label: { type: String, default: '一览' }
  }
})
</script>
