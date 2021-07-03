<template>
  <StatusItem @click="onClick" :clickable="!!clickAction">{{
    status
  }}</StatusItem>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import StatusItem from './StatusItem.vue'
import { registerSW } from 'virtual:pwa-register'

export default defineComponent({
  components: { StatusItem },
  setup() {
    const status = ref('…')
    const clickAction = ref<() => void | null>(null)
    onMounted(() => {
      const updateSW = registerSW({
        onNeedRefresh() {
          status.value = 'Refresh to update'
          clickAction.value = () => {
            updateSW()
          }
        },
        onOfflineReady() {
          status.value = 'Offline ready'
        },
      })
    })
    const onClick = () => {
      clickAction.value?.()
    }
    return { status, onClick, clickAction }
  },
})
</script>
