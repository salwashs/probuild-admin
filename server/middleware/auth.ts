import jwt from "jsonwebtoken";

export default defineEventHandler((event) => {
  const url = event.node.req.url || "";

  // Skip auth for: login endpoint, non-API routes, and OPTIONS preflight
  if (
    url.startsWith("/api/auth/login") ||
    !url.startsWith("/api/") ||
    getMethod(event) === "OPTIONS"
  ) {
    return;
  }

  // Skip auth for public API endpoints (visitor/exhibitor registration from external forms)
  const publicEndpoints = ["/api/visitors", "/api/exhibitors"];
  const isPublicPost =
    getMethod(event) === "POST" &&
    publicEndpoints.some((ep) => url.startsWith(ep));
  if (isPublicPost) {
    return;
  }

  const token = getCookie(event, "auth_token");

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Autentikasi diperlukan.",
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "fallback-secret";
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      email: string;
      roleName: string;
    };

    // Inject auth context into the event
    event.context.auth = {
      userId: decoded.userId,
      email: decoded.email,
      roleName: decoded.roleName,
    };
  } catch {
    deleteCookie(event, "auth_token");
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Session tidak valid atau sudah kadaluarsa.",
    });
  }
});
