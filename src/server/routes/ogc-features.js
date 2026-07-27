import { createLogger } from '../common/helpers/logging/logger.js'
import { ogcFeaturesService } from '../services/ogc-features-service.js'

const logger = createLogger()

function mapErrorResponse(error) {
  if (error?.statusCode) {
    return {
      statusCode: error.statusCode,
      payload: {
        error: 'OGC request failed',
        message: error.message
      }
    }
  }

  return {
    statusCode: 500,
    payload: {
      error: 'Failed to query OGC API',
      message: error?.message || 'Unknown error'
    }
  }
}

export default [
  {
    method: 'GET',
    path: '/api/ogc/collections',
    handler: async (request, h) => {
      try {
        const result = await ogcFeaturesService.getCollections(request.query)
        return h.response(result).code(200)
      } catch (error) {
        logger.error(error, 'Failed to fetch OGC collections')
        const mapped = mapErrorResponse(error)
        return h.response(mapped.payload).code(mapped.statusCode)
      }
    }
  },
  {
    method: 'GET',
    path: '/api/ogc/collections/{collectionId}/items',
    handler: async (request, h) => {
      try {
        const { collectionId } = request.params
        const result = await ogcFeaturesService.getCollectionItems(
          collectionId,
          request.query
        )

        return h.response(result).code(200)
      } catch (error) {
        logger.error(error, 'Failed to fetch OGC collection items')
        const mapped = mapErrorResponse(error)
        return h.response(mapped.payload).code(mapped.statusCode)
      }
    }
  }
]