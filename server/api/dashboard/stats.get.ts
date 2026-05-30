import { prisma } from '../../../lib/prisma'
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async () => {
  try {
    const [visitorsCount, exhibitorsCount, availableBoothsCount] = await Promise.all([
      prisma.visitors.count(),
      prisma.exhibitors.count(),
      prisma.booths.count({
        where: {
          isBooked: false,
          isActive: true
        }
      })
    ])

    return {
      visitors: visitorsCount,
      exhibitors: exhibitorsCount,
      availableBooths: availableBoothsCount
    }
  } catch (error) {
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat mengambil data dashboard.",
    });
  }
})
