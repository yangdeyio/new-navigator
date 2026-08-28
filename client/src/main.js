import { createApp } from 'vue'
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

app.component(Layout.name, Layout)
app.component(Layout.Sider.name, Layout.Sider)
app.component(Layout.Header.name, Layout.Header)
app.component(Layout.Content.name, Layout.Content)
app.component(Layout.Footer.name, Layout.Footer)
app.component(Menu.name, Menu)
app.component(Menu.Item.name, Menu.Item)
app.component(Tabs.name, Tabs)
app.component(Tabs.TabPane.name, Tabs.TabPane)
app.component(Button.name, Button)
app.component(Input.name, Input)
app.component(Input.TextArea.name, Input.TextArea)
app.component(Input.Password.name, Input.Password)
app.component(Modal.name, Modal)
app.component(Tooltip.name, Tooltip)
app.component(List.name, List)
app.component(List.Item.name, List.Item)
app.component(List.Item.Meta.name, List.Item.Meta)
app.component(Avatar.name, Avatar)
app.component(Spin.name, Spin)
app.component(Popconfirm.name, Popconfirm)
app.component(Checkbox.name, Checkbox)
app.component(Card.name, Card)

app.mount('#app')
