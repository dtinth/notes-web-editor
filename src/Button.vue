<template>
  <button
    class="
      bg-bevel
      rounded
      border border-#454443
      hover:border-#555453
      active:border-#8b8685
      py-1
      px-4
      shadow
    "
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>