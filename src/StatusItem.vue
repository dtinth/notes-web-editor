<template>
  <teleport :to="where">
    <component
      class="flex-none flex items-center px-2"
      @click="$emit('click')"
      :is="clickable ? 'button' : 'span'"
      :title="title"
    >
      <span><slot /></span>
    </component>
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  props: {
    alignment: String,
    title: String,
    clickable: Boolean,
  },
  emits: ['click'],
  setup(props) {
    return {
      where: computed(() =>
        props.alignment === 'right' ? '#status-right' : '#status-left',
      ),
    }
  },
})
</script>