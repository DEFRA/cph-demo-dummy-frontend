import { createServer } from './src/server/server.js'

try {
  const server = await createServer()
  await server.initialize()
  console.log('SERVER_OK')
  console.log('ROUTES', server.table().length)
  const interesting = server
    .table()
    .map((r) => r.path)
    .filter((p) =>
      p.includes('pet-registration') ||
      p.includes('/api/maps') ||
      p.includes('/assets/interactive-map')
    )
  console.log('INTERESTING_ROUTES', interesting)

  const res = await server.inject({
    method: 'GET',
    url: '/pet-registration/intro'
  })

  console.log('INTRO_STATUS', res.statusCode)
  console.log('INTRO_BODY_SNIPPET', String(res.payload).slice(0, 400))

  await server.stop()
} catch (error) {
  console.log('SERVER_ERR')
  console.log(error?.stack || String(error))
  process.exit(1)
}
