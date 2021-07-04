import { computed, reactive, Ref, watch } from 'vue'
import { db, NoteModel } from './db'
import { DocumentSaver } from './DocumentSaver'
import { UserUnauthenticatedError } from './NotesApiClient'
import { isNotFound } from './PouchDBUtils'
import { synchronizeNote } from './RemoteNoteSynchronization'

export type ViewModel = {
  readonly: boolean
  placeholder?: string
  value: string
  needsCreation?: { create: () => {} }
}

export function useNoteViewModel(id: Ref<string>) {
  return computed(() => getNoteViewModel(id.value))
}

function getNoteViewModel(id: string): { current: ViewModel } {
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
      if (result === 'loaded') {
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
