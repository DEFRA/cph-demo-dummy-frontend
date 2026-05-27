export default [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      const { name, email, roles } = request.auth.credentials
      return h.view('views/home', {
        userName: name,
        userEmail: email,
        userRole: roles,
        pageTitle: 'CPH Admin Portal'
      })
    }
  }
]
