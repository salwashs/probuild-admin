import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async () => {
  try {
    const events = await prisma.events.findMany({
      include: {
        fields: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "asc" },
    });

    return events;
  } catch (error) {
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat mengambil data event.",
    });
  }
});
