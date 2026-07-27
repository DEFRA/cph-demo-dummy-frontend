import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
dotenv.config({ path: 'compose/aws.env' })

const key = process.env.ORDNANCE_SURVEY_API_KEY
const secret = process.env.ORDNANCE_SURVEY_API_SECRET

const tokenRes = await fetch('https://api.os.uk/oauth2/token/v1', {
  method: 'POST',
  headers: {
    Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'grant_type=client_credentials'
})

const tokenJson = await tokenRes.json()
console.log('token status:', tokenRes.status)
console.log('token keys:', Object.keys(tokenJson).join(','))

const tileRes = await fetch(
  'https://api.os.uk/maps/vector/v1/vts/tile/10/331/494.pbf?srs=3857',
  {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
      Accept: 'application/x-protobuf'
    }
  }
)

console.log('tile status:', tileRes.status)
const body = await tileRes.text()
console.log('tile body:', body.slice(0, 500))
