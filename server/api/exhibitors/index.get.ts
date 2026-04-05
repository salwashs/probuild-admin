import { prisma } from '../../../lib/prisma'
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async () => {
  try {
    const exhibitors = await prisma.exhibitors.findMany({
      include: {
        boothType: true,
        booth: true
      }
    })
    
    return exhibitors
  } catch (error) {
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat mengambil data exhibitor.",
    });
  }
})
