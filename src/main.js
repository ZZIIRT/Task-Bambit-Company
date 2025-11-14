// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css'
import { useUiStore } from './stores/ui'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

// Инициализируем тему до монтирования
const uiStore = useUiStore(pinia)
uiStore.initTheme()

app.mount('#app')
