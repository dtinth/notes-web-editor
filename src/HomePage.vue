<template>
  <div>
    <div class="px-2 py-1">
      <h1 class="text-#8b8685 font-bold">Notes</h1>
    </div>

    <!-- Search field on the left with a new button with icon on the right -->
    <div class="px-2 py-1">
      <div class="flex items-center">
        <div class="flex-auto">
          <input
            type="text"
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
              placeholder-#8b8685
            "
            placeholder="Search for notes"
            v-model="search"
          />
        </div>
        <div class="flex-none ml-2">
          <Button @click="createNote">Create</Button>
        </div>
      </div>
    </div>

    <!-- List of notes grouped by section -->
    <section
      class="
        mx-2
        my-2
        bg-#252423
        rounded
        border border-#555453
        shadow
        overflow-hidden
      "
      v-for="(section, index) of sections"
      :key="index"
    >
      <h2 class="text-#8b8685 font-bold py-1 px-2 bg-glossy">
        <span>{{ section.title }}</span>
      </h2>
      <ul class="px-2 py-1">
        <li v-for="note of section.notes" :key="note.id" class="my-1">
          <router-link :to="'/notes/' + note.id">
            <h3>{{ note.title }}</h3>
            <p class="text-sm text-#8b8685">{{ note.excerpt }}</p>
          </router-link>
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from './Button.vue'
import { db, NoteModel } from './db'
import { parseNote } from './NoteInfoParser'

export default defineComponent({
  components: {
    Button,
  },
  setup() {
    const search = ref('')
    const localDocs = ref<PouchDB.Core.AllDocsResponse<NoteModel> | null>(null)
    const router = useRouter()
    const createNote = () => {
      const id =
        new Date(Date.now()).toJSON().replace(/\W/g, '').slice(0, 15) +
        'Z' +
        (10000 + 10000 * Math.random()).toString().slice(-4)
      router.push(`/notes/${id}`)
    }
    onMounted(async () => {
      const docs = await db.allDocs({ include_docs: true })
      localDocs.value = docs
    })
    const sections = computed(() => {
      const localNotes = localDocs.value?.rows.map((row) => ({
        ...parseNote(row.doc!.contents),
        id: row.id,
      }))
      return [
        {
          title: 'Local notes',
          notes: localNotes,
        },
      ]
    })
    return {
      search,
      createNote,
      sections,
    }
  },
})
</script>

<style>
</style>