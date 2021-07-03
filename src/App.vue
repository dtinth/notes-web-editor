<template>
  <router-view></router-view>
  <PWAStatus />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PWAStatus from './PWAStatus.vue'
import StatusItem from './StatusItem.vue'

export default defineComponent({
  name: 'App',
  components: { StatusItem, PWAStatus },
})
</script>

<style>
@import './App.css';
</style>