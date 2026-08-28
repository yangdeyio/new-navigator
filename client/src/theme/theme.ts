import { computed } from 'vue'
import { theme as antdThemeLib } from 'ant-design-vue'
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'
import { theme } from '../composables/useTheme'

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'HarmonyOS Sans SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif"

const SHARED_TOKENS = {
  borderRadius: 10,
  fontFamily: FONT_FAMILY
}

// 深色主题通过 colorBgBase 派生所有容器色,让 antd 组件与玻璃面板同处一个蓝黑色系
export const antdTheme = computed<ThemeConfig>(() => {
  if (theme.value === 'dark') {
    return {
      algorithm: antdThemeLib.darkAlgorithm,
      token: {
        ...SHARED_TOKENS,
        colorPrimary: '#6c7dff',
        colorInfo: '#6c7dff',
        colorBgBase: '#131832'
      }
    }
  }
  return {
    token: {
      ...SHARED_TOKENS,
      colorPrimary: '#4353e9',
      colorInfo: '#4353e9'
    }
  }
})
