import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";
import { flattenVisitor } from "../../utils/validateVisitorPayload";
import {
  buildVisitorsCsv,
  buildVisitorsExportFilename,
} from "../../utils/exportVisitorsCsv";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const eventId = typeof query.eventId === "string" ? query.eventId.trim() : "";

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "eventId is required",
    });
  }

  try {
    const eventRecord = await prisma.events.findUnique({
      where: { id: eventId },
      include: {
        fields: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!eventRecord) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Event tidak ditemukan.",
      });
    }

    const visitors = await prisma.visitors.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });

    const csv = buildVisitorsCsv({
      fields: eventRecord.fields.map((field) => ({
        key: field.key,
        labelId: field.labelId,
        type: field.type,
        sortOrder: field.sortOrder,
        options: field.options,
      })),
      visitors: visitors.map(flattenVisitor),
    });

    const filename = buildVisitorsExportFilename(eventRecord.slug);

    setHeader(event, "Content-Type", "text/csv; charset=utf-8");
    setHeader(
      event,
      "Content-Disposition",
      `attachment; filename="${filename}"`,
    );

    return send(event, csv);
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err.statusCode) throw error;
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat mengekspor data visitor.",
    });
  }
});
