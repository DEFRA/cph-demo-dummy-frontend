import { createServer } from './src/server/server.js'

const server = await createServer()
await server.initialize()

const response = await server.inject({
  method: 'GET',
  url: '/api/ogc/collections'
})

console.log('status=' + response.statusCode)
if (typeof response.result === 'string') {
  console.log(response.result)
} else {
  console.log(JSON.stringify(response.result).slice(0, 800))
}

await server.stop({ timeout: 0 })
