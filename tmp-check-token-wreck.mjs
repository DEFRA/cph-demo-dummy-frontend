import Wreck from '@hapi/wreck'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(dirname, '.env') })
dotenv.config({ path: path.resolve(dirname, 'compose/aws.env') })

const key = process.env.ORDNANCE_SURVEY_API_KEY
const secret = process.env.ORDNANCE_SURVEY_API_SECRET

console.log('KEY  :', key?.slice(0, 6) + '...')
console.log('SECRET:', secret?.slice(0, 4) + '...')

// Step 1: Get OAuth token via Wreck (same path the plugin uses)
const creds = `${key}:${secret}`
const { res: tokenRes, payload: tokenPayload } = await Wreck.post(
  'https://api.os.uk/oauth2/token/v1',
  {
    headers: {
      Authorization: `Basic ${btoa(creds)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    payload: 'grant_type=client_credentials',
    json: true
  }
)
console.log('Token HTTP status:', tokenRes.statusCode)
console.log('Token payload    :', JSON.stringify(tokenPayload).slice(0, 200))

if (tokenRes.statusCode !== 200 || !tokenPayload?.access_token) {
  console.error('Cannot continue — token fetch failed')
  process.exit(1)
}

const token = tokenPayload.access_token
console.log('Token (first 8)  :', token.slice(0, 8) + '...')

// Step 2: Fetch a real UK tile (zoom 10, roughly over Manchester)
const tileUrl = `https://api.os.uk/maps/vector/v1/vts/tile/10/331/494.pbf?srs=3857`
try {
  const { res: tileRes } = await Wreck.get(tileUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/x-protobuf'
    },
    json: false
  })
  console.log('Tile HTTP status :', tileRes.statusCode)
} catch (e) {
  console.error('Tile fetch error :', e.message)
  if (e.data?.res) console.error('Tile status code :', e.data.res.statusCode)
}
