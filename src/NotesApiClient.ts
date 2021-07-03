import axios from 'axios'
import { getGoogleLoginStatus } from './GoogleSignIn'

export const notesApiClient = axios.create({})

notesApiClient.interceptors.request.use(async (config) => {
  const loginStatus = await getGoogleLoginStatus()
  if (!loginStatus) {
    throw new Error('Not signed in to Google')
  }
  const token = loginStatus.idToken
  ;(config.headers ??= {}).authorization ??= `Bearer ${token}`
  return config
})
