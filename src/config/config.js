import convict from 'convict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

import convictFormatWithValidator from 'convict-format-with-validator'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Ensure local development picks up project root .env values.
// Load .env first so user-supplied credentials take precedence over the
// placeholder values in compose/aws.env (dotenv never overrides already-set vars).
dotenv.config({ path: path.resolve(dirname, '../../.env') })
dotenv.config({ path: path.resolve(dirname, '../../compose/aws.env') })

const fourHoursMs = 14400000
const oneWeekMs = 604800000

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'
const isDevelopment = process.env.NODE_ENV === 'development'

const ogcBaseUrlFromEnv =
  process.env.OGC_API_BASE_URL ??
  process.env.OGC_API_Base_URL ??
  process.env.OGC_API_Base_Url ??
  process.env.OGC_API_ENDPOINT_URL ??
  process.env.OGC_API_Endpoint_URL ??
  process.env.OGC_API_Endpoint_Url ??
  process.env.OGC_API_URL ??
  process.env.OGC_API_Url ??
  process.env.OGC_ENDPOINT_URL ??
  process.env.OGC_Endpoint_URL ??
  null

const ogcApiKeyFromEnv =
  process.env.OGC_API_KEY ??
  process.env.OGC_API_Key ??
  process.env.OGC_KEY ??
  process.env.OGC_Key ??
  null

const ogcApiSecretFromEnv =
  process.env.OGC_API_SECRET ??
  process.env.OGC_API_Secret ??
  process.env.OGC_SECRET ??
  process.env.OGC_Secret ??
  null

convict.addFormats(convictFormatWithValidator)

export const config = convict({
  entra: {
    clientId: {
      doc: 'Entra client ID for App Reg',
      format: String,
      default: 'a-dummy-client-id',
      env: 'ENTRA_CLIENT_ID'
    },
    clientSecret: {
      doc: 'Entra client secret for App Reg',
      format: String,
      default: 'a-dummy-client-secret',
      env: 'ENTRA_CLIENT_SECRET'
    },
    tenant: {
      doc: 'Entra tenant for App Reg',
      format: String,
      default: 'a-dummy-tenant',
      env: 'ENTRA_TENANT'
    }
  },
  serviceVersion: {
    doc: 'The service version, this variable is injected into your docker container in CDP environments',
    format: String,
    nullable: true,
    default: null,
    env: 'SERVICE_VERSION'
  },
  host: {
    doc: 'The IP address to bind',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'HOST'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3001,
    env: 'PORT'
  },
  staticCacheTimeout: {
    doc: 'Static cache timeout in milliseconds',
    format: Number,
    default: oneWeekMs,
    env: 'STATIC_CACHE_TIMEOUT'
  },
  serviceName: {
    doc: 'Applications Service Name',
    format: String,
    default: 'Apply for a CPH Number',
  },
  root: {
    doc: 'Project root',
    format: String,
    default: path.resolve(dirname, '../..')
  },
  assetPath: {
    doc: 'Asset path',
    format: String,
    default: '/public',
    env: 'ASSET_PATH'
  },
  isProduction: {
    doc: 'If this application running in the production environment',
    format: Boolean,
    default: isProduction
  },
  isDevelopment: {
    doc: 'If this application running in the development environment',
    format: Boolean,
    default: isDevelopment
  },
  isTest: {
    doc: 'If this application running in the test environment',
    format: Boolean,
    default: isTest
  },
  log: {
    enabled: {
      doc: 'Is logging enabled',
      format: Boolean,
      default: process.env.NODE_ENV !== 'test',
      env: 'LOG_ENABLED'
    },
    level: {
      doc: 'Logging level',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info',
      env: 'LOG_LEVEL'
    },
    format: {
      doc: 'Format to output logs in.',
      format: ['ecs', 'pino-pretty'],
      default: isProduction ? 'ecs' : 'pino-pretty',
      env: 'LOG_FORMAT'
    },
    redact: {
      doc: 'Log paths to redact',
      format: Array,
      default: isProduction
        ? ['req.headers.authorization', 'req.headers.cookie', 'res.headers']
        : []
    }
  },
  httpProxy: {
    doc: 'HTTP Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'HTTP_PROXY'
  },
  isSecureContextEnabled: {
    doc: 'Enable Secure Context',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_SECURE_CONTEXT'
  },
  session: {
    cache: {
      engine: {
        doc: 'backend cache is written to',
        format: ['redis', 'memory'],
        default: isProduction ? 'redis' : 'memory',
        env: 'SESSION_CACHE_ENGINE'
      },
      name: {
        doc: 'server side session cache name',
        format: String,
        default: 'session',
        env: 'SESSION_CACHE_NAME'
      },
      ttl: {
        doc: 'server side session cache ttl',
        format: Number,
        default: fourHoursMs,
        env: 'SESSION_CACHE_TTL'
      }
    },
    cookie: {
      ttl: {
        doc: 'Session cookie ttl',
        format: Number,
        default: fourHoursMs,
        env: 'SESSION_COOKIE_TTL'
      },
      password: {
        doc: 'session cookie password',
        format: String,
        default: 'the-password-must-be-at-least-32-characters-long',
        env: 'SESSION_COOKIE_PASSWORD',
        sensitive: true
      },
      secure: {
        doc: 'set secure flag on cookie',
        format: Boolean,
        default: isProduction,
        env: 'SESSION_COOKIE_SECURE'
      }
    }
  },
  redis: {
    host: {
      doc: 'Redis cache host',
      format: String,
      default: '127.0.0.1',
      env: 'REDIS_HOST'
    },
    username: {
      doc: 'Redis cache username',
      format: String,
      default: '',
      env: 'REDIS_USERNAME'
    },
    password: {
      doc: 'Redis cache password',
      format: '*',
      default: '',
      sensitive: true,
      env: 'REDIS_PASSWORD'
    },
    keyPrefix: {
      doc: 'Redis cache key prefix name used to isolate the cached results across multiple clients',
      format: String,
      default: 'cph-demo-dummy-frontend:',
      env: 'REDIS_KEY_PREFIX'
    },
    useSingleInstanceCache: {
      doc: 'Connect to a single instance of redis instead of a cluster.',
      format: Boolean,
      default: !isProduction,
      env: 'USE_SINGLE_INSTANCE_CACHE'
    },
    useTLS: {
      doc: 'Connect to redis using TLS',
      format: Boolean,
      default: isProduction,
      env: 'REDIS_TLS'
    }
  },
  nunjucks: {
    watch: {
      doc: 'Reload templates when they are changed.',
      format: Boolean,
      default: isDevelopment
    },
    noCache: {
      doc: 'Use a cache and recompile templates each time',
      format: Boolean,
      default: isDevelopment
    }
  },
  tracing: {
    header: {
      doc: 'Which header to track',
      format: String,
      default: 'x-cdp-request-id',
      env: 'TRACING_HEADER'
    }
  },
  ordnanceSurvey: {
    apiKey: {
      doc: 'Ordnance Survey API key for map display',
      format: String,
      default: null,
      nullable: true,
      env: 'ORDNANCE_SURVEY_API_KEY'
    },
    apiSecret: {
      doc: 'Ordnance Survey API secret for map display',
      format: String,
      default: null,
      nullable: true,
      env: 'ORDNANCE_SURVEY_API_SECRET',
      sensitive: true
    }
  },
  ogcApi: {
    baseUrl: {
      doc: 'OGC API Features base URL',
      format: String,
      default: ogcBaseUrlFromEnv,
      nullable: true,
      env: 'OGC_API_BASE_URL'
    },
    apiKey: {
      doc: 'OGC API key value',
      format: String,
      default: ogcApiKeyFromEnv,
      nullable: true,
      env: 'OGC_API_KEY',
      sensitive: true
    },
    apiSecret: {
      doc: 'OGC API secret value',
      format: String,
      default: ogcApiSecretFromEnv,
      nullable: true,
      env: 'OGC_API_SECRET',
      sensitive: true
    },
    apiKeyHeader: {
      doc: 'Header used when passing the OGC API key',
      format: String,
      default: 'x-api-key',
      env: 'OGC_API_KEY_HEADER'
    },
    apiSecretHeader: {
      doc: 'Header used when passing the OGC API secret',
      format: String,
      default: 'x-api-secret',
      env: 'OGC_API_SECRET_HEADER'
    },
    apiKeyQueryParam: {
      doc: 'Optional query parameter name used for OGC API key',
      format: String,
      default: null,
      nullable: true,
      env: 'OGC_API_KEY_QUERY_PARAM'
    },
    apiSecretQueryParam: {
      doc: 'Optional query parameter name used for OGC API secret',
      format: String,
      default: null,
      nullable: true,
      env: 'OGC_API_SECRET_QUERY_PARAM'
    },
    timeoutMs: {
      doc: 'Timeout for OGC API requests in milliseconds',
      format: Number,
      default: 10000,
      env: 'OGC_API_TIMEOUT_MS'
    }
  }
})

config.validate({ allowed: 'strict' })
