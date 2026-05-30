import jwt from "jsonwebtoken";
import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "auth_token");

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Belum login.",
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "fallback-secret";
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      email: string;
      roleName: string;
    };

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "User tidak ditemukan.",
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    // Token invalid or expired
    deleteCookie(event, "auth_token");
    Sentry.captureException(error);
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Session tidak valid.",
    });
  }
});
