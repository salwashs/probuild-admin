const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/([a-z0-9-]+\.)*probuildintim\.com$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/
]

function isAllowedOrigin(origin: string) {
  return ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(origin))
}

export default defineEventHandler((event) => {
  if (!event.node.req.url?.startsWith('/api/')) return

  const origin = getRequestHeader(event, 'origin')
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': '*'
  }

  // Browser rejects Allow-Origin: * with Allow-Credentials: true.
  if (origin && isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Vary'] = 'Origin'
  } else {
    headers['Access-Control-Allow-Origin'] = '*'
  }

  setResponseHeaders(event, headers)

  if (getMethod(event) === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.statusMessage = 'No Content'
    return 'OK'
  }
})
