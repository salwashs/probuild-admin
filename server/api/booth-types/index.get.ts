import { prisma } from '../../../lib/prisma'
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async () => {
  try {
    const boothTypes = await prisma.boothTypes.findMany({
      include: {
        booths: true
      },
      orderBy: { size: 'asc' }
    })
    
    return boothTypes
  } catch (error) {
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat mengambil tipe booth.",
    });
  }
})
