export default defineEventHandler((event) => {
  // Hanya terapkan untuk endpoint API
  if (event.node.req.url?.startsWith('/api/')) {
    setResponseHeaders(event, {
      "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Expose-Headers": "*"
    })
    
    // Hanlde request OPTIONS (preflight)
    if (getMethod(event) === 'OPTIONS') {
      event.node.res.statusCode = 204
      event.node.res.statusMessage = "No Content"
      return 'OK'
    }
  }
})
