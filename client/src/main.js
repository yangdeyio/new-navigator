import { createApp } from 'vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import router from './router/route'
import { Layout, Menu, Tabs, Button } from 'ant-design-vue'

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

app.mount('#app')
