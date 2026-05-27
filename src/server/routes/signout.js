export default [
  {
    method: 'GET',
    path: '/signout',
    handler: (request, h) => {
      request.cookieAuth.clear()
      return h.redirect('/')
    }
  }
]
