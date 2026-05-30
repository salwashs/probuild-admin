export default defineEventHandler(async (event) => {
  deleteCookie(event, "auth_token", {
    path: "/",
  });

  return { message: "Logout berhasil." };
});
