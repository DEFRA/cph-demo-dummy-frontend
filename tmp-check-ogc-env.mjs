import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

const keys = Object.keys(process.env)
  .filter((key) => key.includes('OGC'))
  .sort()

console.log(keys.join('\n') || 'NO_OGC_KEYS')

const check = [
  'OGC_API_BASE_URL',
  'OGC_API_ENDPOINT_URL',
  'OGC_API_URL',
  'OGC_ENDPOINT_URL',
  'OGC_API_KEY',
  'OGC_KEY',
  'OGC_API_SECRET',
  'OGC_SECRET'
]

for (const key of check) {
  const value = process.env[key]
  console.log(`${key}=${value ? 'SET' : 'MISSING'}`)
}
