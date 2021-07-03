import './global.css'
import { createApp } from 'vue'
import App from './App.vue'
import { setup } from 'twind/shim'
import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from './HomePage.vue'
import NotePage from './NotePage.vue'

setup({
  theme: {
    fontFamily: {
      sans: [
        'Arimo',
        'Helvetica',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
      mono: [
        'Comic Mono',
        'Cousine',
        'Menlo',
        'Monaco',
        'Consolas',
        '"Liberation Mono"',
        '"Courier New"',
        'monospace',
      ],
    },
    extend: {
      colors: {
        '#e9e8e7': '#e9e8e7',
        '#8b8685': '#8b8685',
        '#656463': '#656463',
        '#555453': '#555453',
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
  plugins: {
    'bg-bevel': {
      background: '#252423 linear-gradient(to bottom, #454443, #151413)',
    },
    'bg-emboss': {
      background: '#252423 linear-gradient(to bottom, #151413, #292827)',
    },
    'bg-glossy': {
      background:
        '#252423 linear-gradient(to bottom, #353433 0%, #252423 50%, #151413 50%, #252423 100%)',
    },
  },
})

const routes = [
  { path: '/', component: HomePage },
  { path: '/notes/:id', component: NotePage },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
})

createApp(App).use(router).mount('#app')
