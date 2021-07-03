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
            v-model="search.text"
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
      <ul>
        <li v-for="note of section.notes" :key="note.id">
          <router-link
            :to="'/notes/' + note.id"
            class="
              px-2
              py-2
              block
              border-t border-#353433
              bg-#090807
              hover:bg-#252423
            "
          >
            <h3>{{ note.title }}</h3>
            <p class="text-sm text-#8b8685">{{ note.excerpt }}</p>
          </router-link>
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from './Button.vue'
import { db, NoteModel } from './db'
import { parseNote } from './NoteInfoParser'
import { notesApiClient } from './NotesApiClient'

export default defineComponent({
  components: {
    Button,
  },
  setup() {
    const localDocs = ref<PouchDB.Core.AllDocsResponse<NoteModel> | null>(null)
    const recent = ref<{ id: string; label: string }[] | null>(null)
    const search = reactive({
      text: '',
      displayedId: 0,
      result: [] as NoteItem[],
      nextId: 1,
    })
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
    onMounted(async () => {
      const { data: docs } = await notesApiClient.post(
        '/api/notes?action=recent',
      )
      recent.value = docs
    })
    const sections = computed((): NoteSection[] => {
      if (search.result.length > 0) {
        return [
          {
            title: 'Search result',
            notes: search.result,
          },
        ]
      }
      const localNotes = localDocs.value?.rows
        .sort(
          (a, b) =>
            Date.parse(b.doc!.lastModifiedAt) -
            Date.parse(a.doc!.lastModifiedAt),
        )
        .map((row) => ({
          ...parseNote(row.doc!.contents),
          id: row.id,
        }))
      return [
        {
          title: 'Local notes',
          notes: localNotes ?? [],
        },
        {
          title: 'Recent notes',
          notes:
            recent.value?.map(({ id, label }) => ({
              id,
              title: label,
              excerpt: '',
            })) ?? [],
        },
      ]
    })
    watch(
      () => search.text,
      async (text) => {
        const id = search.nextId++
        const data = text.trim()
          ? (await notesApiClient.post('/api/notes?action=search', { q: text }))
              .data
          : []
        if (id > search.displayedId) {
          search.displayedId = id
          search.result = data
        }
      },
    )
    return {
      search,
      createNote,
      sections,
    }
  },
})

type NoteSection = {
  title: string
  notes: NoteItem[]
}

type NoteItem = {
  id: string
  title: string
  excerpt: string
}
</script>

<style>
</style>