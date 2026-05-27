import Jwt from '@hapi/jwt'

export default [
  {
    method: 'GET',
    path: '/signin',
    handler: (request, h) => {
      const idPayload = Jwt.token.decode(request.auth.artifacts.id_token)
        .decoded.payload

      request.cookieAuth.set({
        name: idPayload.name,
        email: idPayload.preferred_username,
        roles: idPayload.roles
      })

      return h.redirect('/')
    },
    options: {
      auth: {
        mode: 'try',
        strategy: 'azure-auth'
      }
    }
  }
]
