import axios from 'axios'
import { getGoogleLoginStatus } from './GoogleSignIn'

export const notesApiClient = axios.create({})

export class UserUnauthenticatedError extends Error {
  constructor() {
    super('User is not authenticated')
  }
}

notesApiClient.interceptors.request.use(async (config) => {
  const loginStatus = await getGoogleLoginStatus()
  if (!loginStatus) {
    throw new UserUnauthenticatedError()
  }
  const token = loginStatus.idToken
  ;(config.headers ??= {}).authorization ??= `Bearer ${token}`
  return config
})
