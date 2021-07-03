import { VercelRequest, VercelResponse } from '@vercel/node'
import { OAuth2Client } from 'google-auth-library'
import cors from 'cors'

const CLIENT_ID =
  '347735770628-lto200027l05noe9tkilnpqnefn9e6g3.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID)
const enableCors = cors()

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
    res.json(payload)
  } catch (error) {
    console.error(error)
    res.status(500).send(`Error`)
  }
}
