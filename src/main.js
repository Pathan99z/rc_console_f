import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
const authStore = useAuthStore()
await authStore.hydrateSession()

app.use(router)
await router.isReady()
app.mount('#app')
