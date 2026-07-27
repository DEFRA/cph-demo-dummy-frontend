import {
  initAll as initFormsEngine,
  initMaps as initFormsEngineMaps
} from '@defra/forms-engine-plugin/shared.js'

// Initialise forms-engine components used on dynamic form pages.
initFormsEngine()

function tryInitFormsEngineMaps(stage = 'unknown') {
  try {
    const locationFields = document.querySelectorAll('.app-location-field')
    
    if (!locationFields.length) {
      return
    }

    // Avoid duplicate map widgets
    const hasMap = document.querySelector('.map-container')
    if (hasMap) {
      return
    }

    initFormsEngineMaps({
      assetPath: '/assets',
      apiPath: '/api',
      data: {
        VTS_OUTDOOR_URL: '/api/maps/vts/OS_VTS_3857_Outdoor.json',
        VTS_DARK_URL: '/api/maps/vts/OS_VTS_3857_Dark.json',
        VTS_BLACK_AND_WHITE_URL: '/api/maps/vts/OS_VTS_3857_Black_and_White.json',
        VTS_AERIAL_URL: '/api/maps/vts/esri-aerial.json'
      }
    })
  } catch (e) {
    console.error(`[MAP] ${stage}: ${e.message}`)
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => tryInitFormsEngineMaps('DOMContentLoaded'))
} else {
  tryInitFormsEngineMaps('immediate')
}

// Retry after a delay to handle async renders
setTimeout(() => tryInitFormsEngineMaps('timeout-500ms'), 500)

