import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";
import { flattenVisitor } from "../../utils/validateVisitorPayload";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const eventId = typeof query.eventId === "string" ? query.eventId : undefined;

  try {
    const visitors = await prisma.visitors.findMany({
      where: eventId ? { eventId } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return visitors.map(flattenVisitor);
  } catch (error) {
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat mengambil data visitor.",
    });
  }
});
