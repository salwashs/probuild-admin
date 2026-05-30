import { prisma } from '../../../lib/prisma'
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async () => {
  try {
    const roles = await prisma.roles.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return roles
  } catch (error) {
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat mengambil data role.",
    });
  }
})
