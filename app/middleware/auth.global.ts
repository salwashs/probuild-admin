export default defineNuxtRouteMiddleware(async (to) => {
  const { isLoggedIn, fetchUser } = useAuth();

  // If user state is not loaded yet, try to fetch
  if (!isLoggedIn.value) {
    await fetchUser();
  }

  // If going to login page and already logged in, redirect to home
  if (to.path === "/login" && isLoggedIn.value) {
    return navigateTo("/");
  }

  // If not logged in and not on login page, redirect to login
  if (to.path !== "/login" && !isLoggedIn.value) {
    return navigateTo("/login");
  }
});
