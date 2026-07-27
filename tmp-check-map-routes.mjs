import { createServer } from './src/server/server.js'

const paths = [
  '/api/maps/vts/esri-aerial.json',
  '/api/maps/vts/OS_VTS_3857_Outdoor.json',
  '/api/maps/countries.geojson'
]

const server = await createServer()
await server.initialize()

for (const url of paths) {
  const response = await server.inject({ method: 'GET', url })
  console.log(url, response.statusCode, response.headers['content-type'])
}

await server.stop()
