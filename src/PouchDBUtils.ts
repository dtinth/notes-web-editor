export function isNotFound(error: any): error is { status: 404 } {
  return error.status === 404
}
