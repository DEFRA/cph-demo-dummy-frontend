import Blankie from 'blankie'

/**
 * Manage content security policies.
 * @satisfies {import('@hapi/hapi').Plugin}
 */
const contentSecurityPolicy = {
  plugin: Blankie,
  options: {
    // Hash 'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw=' is to support a GOV.UK frontend script bundled within Nunjucks macros
    // https://frontend.design-system.service.gov.uk/import-javascript/#if-our-inline-javascript-snippet-is-blocked-by-a-content-security-policy
    defaultSrc: ['self','http://localhost:3000'],
    fontSrc: ['self', 'data:'],
    connectSrc: [
      'self',
      'wss',
      'data:',
      'https://api.os.uk',
      'https://*.os.uk',
      'https://services.arcgisonline.com',
      'https://*.arcgisonline.com',
      'https://*.arcgis.com'
    ],
    mediaSrc: ['self'],
    styleSrc: ['self', "'unsafe-inline'", 'https://api.os.uk', 'https://*.os.uk'],
    scriptSrc: [
      'self',
      'https://api.os.uk',
      'https://*.os.uk',
      "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='"
    ],
    imgSrc: [
      'self',
      'data:',
      'blob:',
      'https://api.os.uk',
      'https://*.os.uk',
      'https://services.arcgisonline.com',
      'https://*.arcgisonline.com',
      'https://*.arcgis.com'
    ],
    frameSrc: ['self', 'data:'],
    workerSrc: ['self', 'blob:'],
    objectSrc: ['none'],
    frameAncestors: ['none'],
    formAction: ['self','http://localhost:3000'],
    manifestSrc: ['self'],
    generateNonces: false
  }
}

export { contentSecurityPolicy }
