import { createSSRApp } from 'vue'
import App from '../../../src/views/Dashboard.vue'

const app = createSSRApp(App)

app.mount('#app')
