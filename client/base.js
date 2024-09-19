import { createSSRApp } from 'vue'
import Home from './views/Home.vue'

export function createApp () {
  return createSSRApp(Home)
}
