import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(dirname, '.env') })
dotenv.config({ path: path.resolve(dirname, 'compose/aws.env') })

const key = process.env.ORDNANCE_SURVEY_API_KEY
const secret = process.env.ORDNANCE_SURVEY_API_SECRET

console.log('KEY present   :', !!key, '| length:', key?.length)
console.log('SECRET present:', !!secret, '| length:', secret?.length)

// Try the OAuth token endpoint directly
const creds = `${key}:${secret}`
const body = 'grant_type=client_credentials'

try {
  const res = await fetch('https://api.os.uk/oauth2/token/v1', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(creds).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })
  const text = await res.text()
  console.log('OAuth status  :', res.status)
  console.log('OAuth response:', text.slice(0, 300))
} catch (e) {
  console.error('OAuth fetch error:', e.message)
}
