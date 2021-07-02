import { createApp } from 'vue'
import App from './App.vue'
import { setup } from 'twind/shim'

setup({
  theme: {
    fontFamily: {
      sans: ['Arimo', 'Helvetica', 'sans-serif'],
    },
    extend: {
      colors: {
        '#e9e8e7': '#e9e8e7',
        '#8b8685': '#8b8685',
        '#656463': '#656463',
        '#454443': '#454443',
        '#353433': '#353433',
        '#252423': '#252423',
        '#090807': '#090807',
        '#bbeeff': '#bbeeff',
        '#d7fc70': '#d7fc70',
        '#ffffbb': '#ffffbb',
      },
    },
  },
})

createApp(App).mount('#app')