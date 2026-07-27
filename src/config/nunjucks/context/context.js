import path from 'node:path'
import { readFileSync } from 'node:fs'

import { config } from '../../config.js'
import { buildNavigation } from './build-navigation.js'
import { createLogger } from '../../../server/common/helpers/logging/logger.js'

const logger = createLogger()
const assetPath = config.get('assetPath')
const manifestPath = path.join(
  config.get('root'),
  '.public/assets-manifest.json'
)

let webpackManifest

function loadWebpackManifest() {
  try {
    webpackManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  } catch (error) {
    logger.error(`Webpack ${path.basename(manifestPath)} not found`)
  }
}

export function context(request) {
  // Always refresh in request context so template links follow latest hashed assets.
  loadWebpackManifest()

  return {
    assetPath: `${assetPath}`,
    serviceName: config.get('serviceName'),
    serviceUrl: '/',
    breadcrumbs: [],
    requiresManualReview: request?.yar?.get('requiresManualReview') === true,
    navigation: buildNavigation(request),
    getAssetPath(asset) {
      const webpackAssetPath = webpackManifest?.[asset]
      return `${assetPath}/${webpackAssetPath ?? asset}`
    }
  }
}