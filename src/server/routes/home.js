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
        pageTitle: 'Other Service'
      })
    }
  },  
{
    method: 'POST',
    path: '/',
    handler: (request, h) => {
      //const { name, email, roles } = request.auth.credentials       
      const cNumber = request.payload.cNumber
      console.log(request.payload.cNumber)
      return h.redirect('http://localhost:3000?cNumber=' + cNumber)
    }
  },    
]
