import { createApp } from 'vue'
import CounterAnalytics from 'counter-analytics-vue'
import './style.css'
import './github-dark.css'
import App from './App.vue'

const app = createApp(App)

app.use(CounterAnalytics, {
  id: import.meta.env.VITE_COUNTER_ANALYTICS_ID,
  utcOffset: 7,
}).mount('#app')
