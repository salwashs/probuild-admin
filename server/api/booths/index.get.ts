import { prisma } from '../../../lib/prisma'
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async () => {
  try {
    const booths = await prisma.booths.findMany({
      include: {
        boothType: true,
        exhibitors: true
      },
      orderBy: { number: 'asc' }
    })
    
    return booths
  } catch (error) {
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat mengambil data booth.",
    });
  }
})
