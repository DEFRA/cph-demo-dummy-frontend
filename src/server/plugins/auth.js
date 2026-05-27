import Bell from '@hapi/bell'
import Cookie from '@hapi/cookie'
import { config } from '../../config/config.js'

const auth = {
  name: 'auth',
  register: async (server, _options) => {
    await server.register(Bell)
    await server.register(Cookie)

    server.auth.strategy('azure-auth', 'bell', {
      provider: 'azure',
      clientId: config.get('entra.clientId'),
      clientSecret: config.get('entra.clientSecret'),
      password: config.get('session.cookie.password'),
      isSecure: config.get('session.cookie.secure'),
      forceHttps: config.get('session.cookie.secure'),
      config: {
        tenant: config.get('entra.tenant')
      }
    })

    server.auth.strategy('session-auth', 'cookie', {
      cookie: {
        path: '/',
        password: config.get('session.cookie.password'),
        isSecure: config.get('session.cookie.secure'),
        isSameSite: 'Lax',
        ttl: config.get('session.cookie.ttl')
      },
      redirectTo: '/signin'
    })

    server.auth.default('session-auth')
  }
}

export default auth
