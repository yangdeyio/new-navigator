import { createApp, type Component } from 'vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import router from './router/route'
import {
  Layout,
  Menu,
  Tabs,
  Button,
  Input,
  List,
  Avatar,
  Spin,
  Popconfirm,
  Checkbox,
  Card,
  Modal,
  Tooltip
} from 'ant-design-vue'

const app = createApp(App)

app.use(router)

// antd 组件的 name 在类型上是 string | undefined，运行时恒有值；这里统一兜底跳过
function register(name: string | undefined, component: Component): void {
  if (name) app.component(name, component)
}

register(Layout.name, Layout)
register(Layout.Sider.name, Layout.Sider)
register(Layout.Header.name, Layout.Header)
register(Layout.Content.name, Layout.Content)
register(Layout.Footer.name, Layout.Footer)
register(Menu.name, Menu)
register(Menu.Item.name, Menu.Item)
register(Tabs.name, Tabs)
register(Tabs.TabPane.name, Tabs.TabPane)
register(Button.name, Button)
register(Input.name, Input)
register(Input.TextArea.name, Input.TextArea)
register(Input.Password.name, Input.Password)
register(Modal.name, Modal)
register(Tooltip.name, Tooltip)
register(List.name, List)
register(List.Item.name, List.Item)
register(List.Item.Meta.name, List.Item.Meta)
register(Avatar.name, Avatar)
register(Spin.name, Spin)
register(Popconfirm.name, Popconfirm)
register(Checkbox.name, Checkbox)
register(Card.name, Card)

app.mount('#app')
