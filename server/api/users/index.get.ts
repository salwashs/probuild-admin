import { prisma } from '../../../lib/prisma'
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async () => {
  try {
    const users = await prisma.users.findMany({
      include: {
        role: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return users
  } catch (error) {
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat mengambil data user.",
    });
  }
})
