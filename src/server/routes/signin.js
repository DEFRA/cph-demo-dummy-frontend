import Jwt from '@hapi/jwt'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

export default [
  {
    method: 'GET',
    path: '/signin',
    handler: (request, h) => {
      try {
        if (!request.auth?.isAuthenticated) {
          return h.response('Authentication failed').code(401)
        }

        // Extract user info from Azure credentials
        const credentials = request.auth?.credentials || {}
        const profile = credentials?.profile || {}
        
        // Try to decode ID token if available
        let idPayload = null
        if (request.auth?.artifacts?.id_token) {
          try {
            const decoded = Jwt.token.decode(request.auth.artifacts.id_token)
            idPayload = decoded?.decoded?.payload
          } catch (decodeError) {
            logger.warn('Failed to decode ID token, using profile data instead')
          }
        }

        // Build user object from available credentials - Bell/Azure usually provides these
        const userInfo = {
          name: idPayload?.name || profile?.displayName || profile?.name || credentials?.displayName || 'Unknown User',
          email: idPayload?.preferred_username || profile?.email || profile?.emails?.[0] || credentials?.email || 'unknown@example.com',
          roles: idPayload?.roles || profile?.roles || credentials?.roles || []
        }

        logger.info(`User signed in: ${userInfo.email}`)
        request.cookieAuth.set(userInfo)

        return h.redirect('/')
      } catch (error) {
        logger.error(error, 'Error during signin processing')
        return h.response({ 
          statusCode: 500, 
          error: 'Internal Server Error', 
          message: 'Failed to process authentication: ' + (error?.message || 'Unknown error')
        }).code(500)
      }
    },
    options: {
      auth: {
        mode: 'required',
        strategy: 'azure-auth'
      }
    }
  }
]
