import delay from 'delay'
import { computed, reactive, Ref } from 'vue'
import { db } from './db'
import { notesApiClient } from './NotesApiClient'
import { isNotFound } from './PouchDBUtils'

type SynchronizeResult = 'loaded' | 'saved' | 'conflict' | 'not-found'

const activeSynchronizations: Record<
  string,
  Promise<SynchronizeResult> | undefined
> = {}

let needsResynchronizationAfterwards: Record<string, boolean> = {}

export type SynchronizationStatus = {
  state: 'synchronizing' | 'error' | SynchronizeResult
}
const synchronizationStatus = reactive<Record<string, SynchronizationStatus>>(
  {},
)

export function useSynchronizationStatus(id: Ref<string>) {
  return computed(() => synchronizationStatus[id.value])
}

export async function synchronizeNote(id: string): Promise<SynchronizeResult> {
  const active = activeSynchronizations[id]
  if (active) {
    needsResynchronizationAfterwards[id] = true
    return active
  }

  const promise = performSynchronization(id)
  activeSynchronizations[id] = promise
  synchronizationStatus[id] = { state: 'synchronizing' }
  try {
    const result = await promise
    synchronizationStatus[id] = { state: result }
    return result
  } catch (error) {
    synchronizationStatus[id] = { state: 'error' }
    throw error
  } finally {
    ;(async () => {
      await delay(2500)
      delete activeSynchronizations[id]
      if (needsResynchronizationAfterwards[id]) {
        delete needsResynchronizationAfterwards[id]
        synchronizeNote(id)
      }
    })()
  }
}

async function performSynchronization(id: string): Promise<SynchronizeResult> {
  let localNote = await db.get(id).catch((error) => {
    if (isNotFound(error)) return null
    throw error
  })

  const logPrefix = `[synchronizeNote(${id})] `
  console.log(`${logPrefix}Synchronizing...`)

  const { data } = await notesApiClient.post('/api/notes?action=sync', {
    id,
    write: localNote
      ? {
          lastSynchronizedHash: localNote.lastSuccessfulSynchronization?.hash,
          contents: localNote.contents,
        }
      : undefined,
  })
  console.log(`${logPrefix}Server said: ${data.status}`)

  if (typeof data.contents !== 'string') {
    if (!localNote) {
      console.log(`${logPrefix}Note not found`)
      return 'not-found'
    } else {
      console.log(`${logPrefix}Note has been deleted on the server`)
      return 'conflict'
    }
  }

  if (!localNote) {
    console.log(`${logPrefix}Note has been loaded from the server`)
    await db.put({
      _id: id,
      contents: data.contents,
      lastModifiedAt: new Date().toJSON(),
      lastAccessedAt: new Date().toJSON(),
      lastSuccessfulSynchronization: {
        synchronizedAt: new Date().toJSON(),
        hash: data.hash,
        contents: data.contents,
      },
    })
    return 'loaded'
  }

  // Get the latest state of the note, to prevent PouchDB conflicts
  localNote = await db.get(id)

  if (data.written) {
    console.log(`${logPrefix}Note has been saved to the server`)
    await db.put({
      ...localNote,
      lastSuccessfulSynchronization: {
        synchronizedAt: new Date().toJSON(),
        hash: data.hash,
        contents: data.contents,
      },
    })
    return 'saved'
  }

  if (
    localNote.lastSuccessfulSynchronization &&
    localNote.contents === localNote.lastSuccessfulSynchronization.contents
  ) {
    console.log(`${logPrefix}Note has been updated from the server`)
    await db.put({
      ...localNote,
      contents: data.contents,
      lastModifiedAt: new Date().toJSON(),
      lastSuccessfulSynchronization: {
        synchronizedAt: new Date().toJSON(),
        hash: data.hash,
        contents: data.contents,
      },
    })
    return 'loaded'
  }

  console.log(
    `${logPrefix}Note has been modified by both the server and the client — conflict`,
  )
  return 'conflict'
}
