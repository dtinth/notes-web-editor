export class DocumentSaver<T> {
  private needsSaving = false
  private savingIsInProgress = false
  private getNewDoc?: (doc: T) => T
  constructor(private db: PouchDB.Database<T>, private docId: string) {}
  public onSave = () => {}
  requestToSave(getNewDoc: (doc: T) => T) {
    this.needsSaving = true
    this.getNewDoc = getNewDoc
    this.check()
  }
  private async check() {
    if (!this.needsSaving) {
      return
    }
    if (this.savingIsInProgress) {
      return
    }
    this.savingIsInProgress = true
    this.needsSaving = false
    try {
      const doc = await this.db.get(this.docId)
      const result = await this.db.put({
        ...this.getNewDoc!(doc),
        _id: this.docId,
        _rev: doc._rev,
      })
      console.log(
        '[DocumentSaver] Saved document [%s..%s] %s',
        doc._rev,
        result.rev,
        this.docId,
      )
      this.onSave()
    } finally {
      this.savingIsInProgress = false
      await this.check()
    }
  }
}
