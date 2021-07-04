<template>
  <div>
    <div class="px-2 py-1">
      <h1 class="text-#8b8685 font-bold">
        <router-link to="/">Notes</router-link> &rarr; {{ id }}
      </h1>
    </div>

    <div class="mx-2 my-1 relative">
      <div
        class="
          whitespace-pre-wrap
          min-h-[50vh]
          font-mono
          pt-3
          pb-12
          px-4
          border border-transparent
          opacity-0
          select-none
          pointer-events-none
        "
      >
        {{ data.value || data.placeholder || '' }}
      </div>
      <textarea
        class="
          absolute
          inset-0
          w-full
          bg-emboss
          rounded
          border border-#454443
          hover:border-#555453
          active:border-#8b8685
          py-3
          px-4
          shadow
          font-mono
          placeholder-#8b8685
          resize-none
        "
        :readonly="data.readonly"
        v-model="data.value"
        :placeholder="data.placeholder"
        ref="textarea"
      />
    </div>
    <div class="mx-2 mb-2 text-right">
      <Button v-if="data.needsCreation" @click="data.needsCreation?.create"
        >Create Note Locally</Button
      >
    </div>
    <StatusItem
      v-if="synchronizationStatus"
      @click="data.removeLocal?.($router)"
      :clickable="!!data.removeLocal"
    >
      {{ synchronizationStatus.state }}
    </StatusItem>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Button from './Button.vue'
import { useNoteViewModel } from './NoteHook'
import { useSynchronizationStatus } from './RemoteNoteSynchronization'
import StatusItem from './StatusItem.vue'

export default defineComponent({
  components: {
    Button,
    StatusItem,
  },
  setup() {
    const route = useRoute()
    const textarea = ref()
    const id = computed(() => route.params.id as string)
    const dataRef = useNoteViewModel(id)
    const synchronizationStatus = useSynchronizationStatus(id)
    const data = computed(() => dataRef.value.current)
    watch(
      () => data.value.readonly,
      (readonly) => {
        if (!readonly) {
          textarea.value?.focus()
        }
      },
    )
    return { id, data, textarea, synchronizationStatus }
  },
})
</script>

<style>
</style>