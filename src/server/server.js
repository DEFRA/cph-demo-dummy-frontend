import path from 'path'
import hapi from '@hapi/hapi'
import Scooter from '@hapi/scooter'
import crumb from '@hapi/crumb'
import Inert from '@hapi/inert'

import { router } from './router.js'
import { config } from '../config/config.js'
import { pulse } from './common/helpers/pulse.js'
import { catchAll } from './common/helpers/errors.js'
import { nunjucksConfig } from '../config/nunjucks/nunjucks.js'
import { setupProxy } from './common/helpers/proxy/setup-proxy.js'
import { requestTracing } from './common/helpers/request-tracing.js'
import { requestLogger } from './common/helpers/logging/request-logger.js'
import { sessionCache } from './common/helpers/session-cache/session-cache.js'
import { getCacheEngine } from './common/helpers/session-cache/cache-engine.js'
import { secureContext } from '@defra/hapi-secure-context'
import { contentSecurityPolicy } from './common/helpers/content-security-policy.js'
import { metrics } from '@defra/cdp-metrics'
import formsEnginePlugin from '@defra/forms-engine-plugin'

import { context as nunjucksContext } from '../config/nunjucks/context/context.js'
import { formsService } from './services/forms-service.js'
import auth from './plugins/auth.js'
import { getBlockedLocationMessage } from './common/helpers/address-validation.js'

const LOCATION_COMPONENT_BY_PATH = {
  'livestock-location': 'livestockLocation'
}

export async function createServer() {
  setupProxy()
  const selectedCacheEngine = config.get('isProduction')
    ? config.get('session.cache.engine')
    : 'memory'

  const server = hapi.server({
    host: config.get('host'),
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      },
      files: {
        relativeTo: path.resolve(config.get('root'), '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    },
    cache: [
      {
        name: config.get('session.cache.name'),
        engine: getCacheEngine(selectedCacheEngine)
      }
    ],
    state: {
      strictHeader: false
    }
  })
  const formSubmissionService = {
    async submit() {
      return { ok: true }
    }
  }
  
  const osApiKey = config.get('ordnanceSurvey.apiKey')
  const osApiSecret = config.get('ordnanceSurvey.apiSecret')
  
  const outputService = {
    async save() {
      return { ok: true }
    },
    async submit(context, request) {
      const requiresManualReview =
        request?.yar?.get('requiresManualReview') === true

      if (requiresManualReview) {
        if (request?.yar) {
          request.yar.clear('cphNumber')
        }

        return {
          ok: true,
          reference: `MANUAL-${Date.now()}`
        }
      }

      // Generate a CPH in the format 12/345/4999.
      const sectionA = Math.floor(Math.random() * 100).toString().padStart(2, '0')
      const sectionB = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      const sectionC = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      const cphNumber = `${sectionA}/${sectionB}/${sectionC}`
      
      // Store CPH in session for the status page
      if (request?.yar) {
        request.yar.set('cphNumber', cphNumber)
      }
      
      // Return reference number for redirect
      return { 
        ok: true,
        reference: cphNumber
      }
    }
  }

  const host = config.get('host')
  const baseUrl = `http://${host === '0.0.0.0' ? 'localhost' : host}:${config.get('port')}`

  const pluginOptions = {
    nunjucks: {
      baseLayoutPath: 'layouts/page.njk',
      paths: [
        path.resolve(config.get('root'), 'src/server'),
        path.resolve(config.get('root'), 'src/server/views'),
        path.resolve(config.get('root'), 'src/server/common/templates'),
        path.resolve(config.get('root'), 'src/server/common/components')
      ]
    },
    viewContext: nunjucksContext,
    baseUrl,
    cache: config.get('session.cache.name'),
    services: {
      formsService,
      formSubmissionService,
      outputService
    },
    onRequest: (request, h) => {
      if (request.method !== 'post') {
        return h.continue
      }

      const path = request.params?.path
      const componentName = LOCATION_COMPONENT_BY_PATH[path]

      if (!componentName) {
        return h.continue
      }

      const message = getBlockedLocationMessage(request.payload, componentName)
      if (!message) {
        return h.continue
      }

      // Coordinates match a blocked location (e.g. a car park).
      // Save the submitted values to session and redirect to a confirmation
      // page rather than showing a validation error on this page.
      request.yar.set('pendingLivestockLocation', {
        easting: request.payload?.['livestockLocation__easting'],
        northing: request.payload?.['livestockLocation__northing'],
        message
      })

      return h.redirect('/cph-check-location').code(303)
    }
  }

  if (osApiKey && osApiSecret) {
    pluginOptions.ordnanceSurveyApiKey = osApiKey
    pluginOptions.ordnanceSurveyApiSecret = osApiSecret
  }

  await server.register([
    requestLogger,
    requestTracing,
    metrics,
    secureContext,
    pulse,
    sessionCache,
    nunjucksConfig,
    Inert,
    Scooter,
    contentSecurityPolicy,
    auth,
    {
      plugin: crumb
    },
    {
      plugin: formsEnginePlugin,
      options: pluginOptions
    },
    router
  ])

  server.ext('onPreResponse', catchAll)

  return server
}
