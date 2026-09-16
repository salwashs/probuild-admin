const PUBLIC_PATHS = new Set(['/login'])

function isPublicRoute(path: string) {
  return PUBLIC_PATHS.has(path) || path.startsWith('/register')
}

export default defineNuxtRouteMiddleware(async (to) => {
  const { isLoggedIn, fetchUser } = useAuth()

  if (isPublicRoute(to.path)) {
    if (to.path === '/login') {
      if (!isLoggedIn.value) {
        await fetchUser()
      }
      if (isLoggedIn.value) {
        return navigateTo('/')
      }
    }
    return
  }

  // If user state is not loaded yet, try to fetch
  if (!isLoggedIn.value) {
    await fetchUser()
  }

  // If not logged in and not on login page, redirect to login
  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
})
