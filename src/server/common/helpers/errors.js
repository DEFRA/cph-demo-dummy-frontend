import { statusCodes } from '../constants/status-codes.js'

function statusCodeMessage(statusCode) {
  switch (statusCode) {
    case statusCodes.notFound:
      return 'Page not found'
    case statusCodes.forbidden:
      return 'Forbidden'
    case statusCodes.unauthorized:
      return 'Unauthorized'
    case statusCodes.badRequest:
      return 'Bad Request'
    default:
      return 'Something went wrong'
  }
}

export function catchAll(request, h) {
  const { response } = request

  if (!('isBoom' in response)) {
    return h.continue
  }

  const statusCode = response.output.statusCode
  const errorMessage = statusCodeMessage(statusCode)

  if (statusCode >= statusCodes.internalServerError) {
    request.logger.error(response?.stack)
  }

  try {
    return h
      .view('error/index', {
        pageTitle: errorMessage,
        heading: statusCode,
        message: errorMessage
      })
      .code(statusCode)
  } catch (error) {
    request.logger.error(error)

    // Fall back to the original Boom payload when view rendering is unavailable.
    return h
      .response(response.output?.payload ?? {
        statusCode,
        error: 'Internal Server Error',
        message: errorMessage
      })
      .code(statusCode)
  }
}
