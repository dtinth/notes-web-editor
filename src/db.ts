import PouchDB from 'pouchdb/dist/pouchdb.js'

export type NoteModel = {
  contents: string
  lastAccessedAt: string
  lastModifiedAt: string
  lastSuccessfulSynchronization?: {
    synchronizedAt: string
    contentHash: string
  }
}

export const db = new PouchDB<NoteModel>('notes-web-editor')
