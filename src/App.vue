<template>
  <router-view></router-view>
  <PWAStatus />
  <GoogleSignInStatus />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PWAStatus from './PWAStatus.vue'
import GoogleSignInStatus from './GoogleSignInStatus.vue'

export default defineComponent({
  name: 'App',
  components: { PWAStatus, GoogleSignInStatus },
})
</script>