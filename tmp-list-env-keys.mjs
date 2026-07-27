import dotenv from 'dotenv'

const result = dotenv.config({ path: './.env' })

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

const keys = Object.keys(result.parsed ?? {}).sort()
console.log(keys.join('\n'))
