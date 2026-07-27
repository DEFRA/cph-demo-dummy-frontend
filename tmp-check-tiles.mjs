import { createServer } from './src/server/server.js'

const server = await createServer()
await server.initialize()

// Check tile proxy (needs OAuth token from key+secret)
const tile = await server.inject({ method: 'GET', url: '/api/tile/10/512/512.pbf' })
console.log('tile proxy      :', tile.statusCode, tile.headers['content-type'])

// Check map-proxy (used for glyphs/sources)
const proxy = await server.inject({
  method: 'GET',
  url: '/api/map-proxy?url=' + encodeURIComponent('https://api.os.uk/maps/vector/v1/vts?srs=3857')
})
console.log('map-proxy       :', proxy.statusCode, String(proxy.payload).slice(0, 120))

// Check the outdoor VTS style
const style = await server.inject({ method: 'GET', url: '/api/maps/vts/OS_VTS_3857_Outdoor.json' })
console.log('outdoor style   :', style.statusCode)

await server.stop()
