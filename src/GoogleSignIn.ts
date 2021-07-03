import pMemoize from 'p-memoize'
const currentUserChangedCallbacks = new Set<() => void>()

const ensureGapiInitialized = pMemoize(async () => {
  const script = document.createElement('script')
  const loadPromise = new Promise((resolve, reject) => {
    script.onload = resolve
    script.onerror = reject
  })
  script.src = 'https://apis.google.com/js/platform.js'
  script.async = true
  document.body.appendChild(script)
  await loadPromise

  await new Promise((resolve) => {
    window.gapi.load('auth2', resolve)
  })

  await gapi.auth2
    .init({
      client_id:
        '347735770628-lto200027l05noe9tkilnpqnefn9e6g3.apps.googleusercontent.com',
    })
    .then(() => {})

  const authInstance = gapi.auth2.getAuthInstance()
  authInstance.currentUser.listen(() => {
    currentUserChangedCallbacks.forEach((callback) => callback())
  })

  return gapi
})

export async function getGoogleLoginStatus() {
  const gapi = await ensureGapiInitialized()
  const authInstance = gapi.auth2.getAuthInstance()
  const currentUser = authInstance.currentUser.get()
  if (!currentUser || !currentUser.isSignedIn()) {
    return null
  }
  return {
    name: currentUser.getBasicProfile().getName(),
    email: currentUser.getBasicProfile().getEmail(),
    idToken: currentUser.getAuthResponse().id_token,
    signOut: () => {
      authInstance.signOut()
    },
  }
}

export function onCurrentUserChanged(callback: () => void): () => void {
  ensureGapiInitialized()
  currentUserChangedCallbacks.add(callback)
  return () => {
    currentUserChangedCallbacks.delete(callback)
  }
}

export async function signInWithGoogle() {
  const gapi = await ensureGapiInitialized()
  const authInstance = gapi.auth2.getAuthInstance()
  return authInstance.signIn()
}
