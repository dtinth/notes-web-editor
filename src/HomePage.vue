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
            @click="createNote"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const search = ref('')
    const router = useRouter()
    const createNote = () => {
      const id =
        new Date(Date.now()).toJSON().replace(/\W/g, '').slice(0, 15) +
        'Z' +
        (10000 + 10000 * Math.random()).toString().slice(-4)
      router.push(`/notes/${id}`)
    }
    return {
      search,
      createNote,
    }
  },
})
</script>

<style>
</style>