const prefillData = {
  registrationType: 'permanentCPH',
  holdingDescription: 'agricultural',
  title: 'Mrs',
  firstName: 'Joanna',
  middleName: '',
  lastName: 'Smith',
  businessName: 'Tesco',
  emailAddress: 'Joannasmith@gmail.com',
  phoneNumber: '07991326281',
  businessAddress__uprn: '',
  businessAddress__addressLine1: 'Flat1 Hunsaker',
  businessAddress__addressLine2: 'Alfred Street',
  businessAddress__town: 'Reading',
  businessAddress__county: 'Berkshire',
  businessAddress__postcode: 'RG1 7AU',
  address__uprn: '',
  address__addressLine1: 'Flat 69 Hunsaker',
  address__addressLine2: 'Alfred Street',
  address__town: 'Reading',
  address__county: 'Berkshire',
  address__postcode: 'RG1 7AU',
  livestockLocation__easting: 471026,
  livestockLocation__northing: 171813,
  livestockRight: true,
  landCphNumber: true
}

export default [
   {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      const credentials = request.auth?.credentials || {}
      const { name, email, roles } = credentials
      return h.view('views/home', {
        userName: name || 'User',
        userEmail: email || 'unknown@example.com',
        userRole: roles || [],       
        crumb: request.plugins.crumb,
        pageTitle: 'Other Service'
      })
    }
  },
{
    method: 'POST',
    path: '/',    
    handler: (request, h) => {              
      const cNumber = request.payload.cNumber?.trim();  
      const cphNumbers = ['22/33/444', '55/66/777', '88/99/000'] 
      if (!cphNumbers.includes(cNumber)) {
        return h.view('views/home', {
          errorMessage: 'CPH number does not exist.',
          crumb: request.plugins.crumb,
          cNumber,
          pageTitle: 'Other Service'
        })
      }      
      request.yar.set('cphNumber', cNumber)      
      return h.redirect('/cph-found')
    }
      //return h.redirect(`http://localhost:3000/?cNumber=${cNumber}`)
  },
  {
    method: 'GET',
    path: '/cph-found',
    handler: (request, h) => {
      const cphNumber = request.yar?.get('cphNumber') || ''
      if (!cphNumber) {
        return h.redirect('/')
      }
      return h.view('views/cphFound', {
        cphNumber,
        pageTitle: 'CPH Number Found'
      })
    }
  },
  {
    method: 'GET',
    path: '/cph-found/edit',
    handler: async (request, h) => {
      const cphNumber = request.yar?.get('cphNumber') || ''

      if (!cphNumber) {
        return h.redirect('/')
      }

      request.yar?.clear('requiresManualReview')
      request.yar?.clear('pendingLivestockLocation')

      const cacheService =
        request.server.plugins['forms-engine-plugin']?.cacheService ??
        request.server.plugins['@defra/forms-engine-plugin']?.cacheService

      if (cacheService) {
        const formRequest = {
          ...request,
          params: {
            ...request.params,
            slug: 'pet-registration'
          }
        }

        const existingState = await cacheService.getState(formRequest)
        await cacheService.setState(formRequest, {
          ...existingState,
          ...prefillData
        })
      }

      return h.redirect('/pet-registration/summary')
    }
  },
  {
    method: 'GET',
    path: '/cph-check-location',
    handler: (request, h) => {
      const pending = request.yar?.get('pendingLivestockLocation')
      if (!pending) {
        return h.redirect('/pet-registration/livestock-location')
      }
      return h.view('views/cphCheckLocation', {
        easting: pending.easting,
        northing: pending.northing,
        message: pending.message,
        crumb: request.plugins.crumb,
        pageTitle: 'Check livestock location'
      })
    }
  },
  {
    method: 'GET',
    path: '/cph-check-location/confirm',
    handler: async (request, h) => {
      const pending = request.yar?.get('pendingLivestockLocation')
      if (!pending) {
        return h.redirect('/pet-registration/livestock-location')
      }

      const cacheService =
        request.server.plugins['forms-engine-plugin']?.cacheService ??
        request.server.plugins['@defra/forms-engine-plugin']?.cacheService

      if (cacheService) {
        const formRequest = {
          ...request,
          params: { ...request.params, slug: 'pet-registration' }
        }
        const existingState = await cacheService.getState(formRequest)
        await cacheService.setState(formRequest, {
          ...existingState,
          livestockLocation__easting: Number(pending.easting),
          livestockLocation__northing: Number(pending.northing)
        })
      }

      request.yar?.set('requiresManualReview', true)

      request.yar.clear('pendingLivestockLocation')
      return h.redirect('/pet-registration/livestock-right')
    }
  },
  {
    method: 'GET',
    path: '/pet-registration/status',
    handler: (request, h) => {
      // Retrieve the CPH number from session state
      const cphNumber = request.yar?.get('cphNumber') || ''
      const requiresManualReview =
        request.yar?.get('requiresManualReview') === true
      
      return h.view('views/status', {
        cphNumber,
        requiresManualReview,
        pageTitle: 'Registration Confirmation'
      })
    }
  }
]
