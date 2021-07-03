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
      <Button v-if="data.needsCreation" @click="data.needsCreation.create"
        >Create Note Locally</Button
      >
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { db, NoteModel } from './db'
import Button from './Button.vue'
import { DocumentSaver } from './DocumentSaver'
import { notesApiClient, UserUnauthenticatedError } from './NotesApiClient'
import { synchronizeNote } from './RemoteNoteSynchronization'
import { isNotFound } from './PouchDBUtils'

export default defineComponent({
  components: {
    Button,
  },
  setup() {
    const route = useRoute()
    const textarea = ref()
    const id = computed(() => route.params.id as string)
    const dataRef = computed(() => getNoteViewModel(id.value))
    const data = computed(() => dataRef.value.current)
    watch(
      () => data.value.readonly,
      (readonly) => {
        if (!readonly) {
          textarea.value?.focus()
        }
      },
    )
    return { id, data, textarea }
  },
})

type ViewModel = {
  readonly: boolean
  placeholder?: string
  value: string
  needsCreation?: { create: () => {} }
}

function getNoteViewModel(id: string) {
  if (!id) {
    return {
      current: {
        readonly: true,
        value: '',
        placeholder: `No ID specified...`,
      },
    }
  }

  const note = reactive<{ current: ViewModel }>({
    current: {
      readonly: true,
      value: '',
      placeholder: `Loading note ${id}...`,
    },
  })

  async function load() {
    try {
      const doc = await db.get(id)
      note.current = getNoteViewModel(doc)
    } catch (error) {
      if (isNotFound(error)) {
        await handleNotFound()
        return
      }
      showError(`Unable to load the note: ${error}`)
      throw error
    }
  }

  function getNoteViewModel(initialDoc: NoteModel & PouchDB.Core.GetMeta) {
    const viewModel = reactive({
      readonly: false,
      value: initialDoc.contents,
    })
    const saver = new DocumentSaver<NoteModel>(db, id)
    saver.onSave = () => {
      synchronizeNote(id)
    }

    // We need to reload due to new contents
    synchronizeNote(id).then((result) => {
      if (result === 'loaded') {
        load()
      }
    })

    watch(
      () => viewModel.value,
      (newValue) => {
        saver.requestToSave((doc) => ({
          ...doc,
          contents: newValue,
          lastModifiedAt: new Date().toJSON(),
        }))
      },
    )
    return viewModel
  }

  function showError(message: string) {
    note.current = {
      readonly: true,
      value: '',
      placeholder: message,
    }
  }

  async function handleNotFound() {
    const showMessage = (m: string, canCreate = false) => {
      note.current = {
        readonly: true,
        value: '',
        placeholder: m,
        ...(canCreate ? { needsCreation: { create } } : {}),
      }
    }
    try {
      showMessage('Looking for an existing note on the server...')
      const result = await synchronizeNote(id)
      if (result) {
        await load()
      } else {
        showMessage(
          `Unable to find the requested note, and the note with requested ID does not exist on the server. You can create this note locally.`,
          true,
        )
      }
    } catch (error) {
      if (error instanceof UserUnauthenticatedError) {
        showMessage(
          `Unable to find the requested note. ` +
            `Also unable to look for an existing note on the server because you are not yet signed in. ` +
            `You can create this note locally, but if a note exists on the server with the same ID, there will be a conflict when synchronizing.`,
          true,
        )
        return
      }
      throw error
    }
  }

  async function create() {
    note.current = {
      readonly: true,
      value: '',
      placeholder: `Creating a new note...`,
      needsCreation: { create },
    }
    try {
      await db.put({
        _id: id,
        contents: '---\npublic: false\n---\n\n',
        lastAccessedAt: new Date().toJSON(),
        lastModifiedAt: new Date().toJSON(),
      })
      await load()
    } catch (error) {
      console.error(error)
      showError(`Unable to create a note: ${error}`)
    }
  }

  load()

  return note
}
</script>

<style>
</style>