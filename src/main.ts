import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import router from './router'
import './styles.css'
import './assets/main.css'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
auth.loadUser()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast)
app.mount('#app')
