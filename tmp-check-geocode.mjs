import { createServer } from './src/server/server.js'

const server = await createServer()
await server.initialize()

const response = await server.inject({
  method: 'GET',
  url: '/api/geocode-proxy?query=London'
})

console.log('STATUS', response.statusCode)
console.log('CONTENT_TYPE', response.headers['content-type'])
console.log('PAYLOAD', String(response.payload).slice(0, 1000))

await server.stop()
