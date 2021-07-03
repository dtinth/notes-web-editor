<template>
  <div>
    <div class="px-2 py-1">
      <h1 class="text-#8b8685 font-bold">
        <router-link to="/">Notes</router-link> &rarr; {{ id }}
      </h1>
    </div>

    <div class="px-2 py-1">
      <textarea
        class="
          w-full
          bg-emboss
          rounded
          border border-#454443
          hover:border-#555453
          active:border-#8b8685
          py-1
          px-2
          shadow
          font-mono
          placeholder-#8b8685
        "
        :readonly="data.readonly"
        :value="data.value"
        :placeholder="data.placeholder"
        ref="textarea"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { db } from './db'

export default defineComponent({
  setup() {
    const route = useRoute()
    const textarea = ref()
    const id = computed(() => route.params.id as string)
    const dataRef = computed(() => getNoteModel(id.value))
    const data = computed(() => dataRef.value.current)
    watch(
      () => data.value.readonly,
      (readonly) => {
        if (!readonly) {
          textarea.value.focus()
        }
      },
    )
    return { id, data }
  },
})

type ViewModel = {
  readonly: boolean
  placeholder?: string
  value: string
  needsCreation?: boolean
}

function getNoteModel(id: string) {
  const note = reactive<{ current: ViewModel }>({
    current: {
      readonly: true,
      value: '',
      placeholder: `Searching for ${id}...`,
    },
  })

  async function load() {
    try {
      const doc = await db.get(id)
      note.current = {
        readonly: false,
        value: doc.contents,
      }
    } catch (error) {
      if (isNotFound(error)) {
        handleNotFound()
        return
      }
      note.current = {
        readonly: true,
        value: '',
        placeholder: `Unable to load the note: ${error}.`,
      }
      throw error
    }
  }

  async function handleNotFound() {
    note.current = {
      readonly: true,
      value: '',
      placeholder:
        `Unable to find the requested note. ` +
        `You can create this note locally, but if a note exists on the server with the same ID, there will be a conflict when synchronizing.`,
      needsCreation: true,
    }
  }

  load()

  return note
}

function isNotFound(error: any): error is { status: 404 } {
  return error.status === 404
}
</script>

<style>
</style>