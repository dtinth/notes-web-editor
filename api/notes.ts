import { VercelRequest, VercelResponse } from '@vercel/node'
import { OAuth2Client } from 'google-auth-library'
import cors from 'cors'
import axios from 'axios'

const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? '').split(',')
const CLIENT_ID =
  '347735770628-lto200027l05noe9tkilnpqnefn9e6g3.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID)
const enableCors = cors()

const notesApiToken = process.env.NOTES_API_TOKEN
const notesApi = axios.create({
  baseURL: process.env.NOTES_API_BASE,
  params: { key: notesApiToken },
})

export default async (req: VercelRequest, res: VercelResponse) => {
  await new Promise<void>((resolve, reject) => {
    enableCors(req, res, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })

  try {
    const authorization = req.headers.authorization?.split?.(' ')
    if (authorization?.length !== 2 || authorization?.[0] !== 'Bearer') {
      res.status(400).send('Needs a Bearer token')
      return
    }
    const token = authorization[1]
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (
      !payload ||
      !payload.email_verified ||
      !payload.email ||
      !ALLOWED_EMAILS.includes(payload.email)
    ) {
      res.status(401).send('Not allowed')
      return
    }

    if (req.query.action === 'sync') {
      const response = await notesApi.post('/sync', req.body)
      res.json(response.data)
      return
    }

    if (req.query.action === 'search') {
      const response = await notesApi.post('/search', req.body)
      res.json(response.data)
      return
    }

    if (req.query.action === 'recent') {
      const response = await notesApi.get('/sidebar')
      const recent = response.data
        .filter((x) => ['uncommitted', 'recent'].includes(x.id))
        .flatMap((x) => {
          return x.children
            .filter((x) => x.noteId)
            .map((x) => ({ id: x.noteId, label: x.label }))
        })
        .filter(deduplicate((x: any) => x.id))
      res.json(recent)
      return
    }

    res.status(400).send('Unknown action')
  } catch (error) {
    console.error(error)
    res.status(500).send(`Error`)
  }
}

function deduplicate<T>(f: (element: T) => string): (value: T) => boolean {
  const seen: { [key: string]: boolean } = {}
  return (value) => {
    const key = f(value)
    return seen[key] === undefined ? (seen[key] = true) : false
  }
}
