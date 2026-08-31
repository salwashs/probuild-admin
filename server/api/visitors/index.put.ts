import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";
import {
  flattenVisitor,
  getEventWithFields,
  visitorHttpError,
  updateVisitorForEvent,
  VisitorConflictError,
  VisitorValidationError,
} from "../../utils/validateVisitorPayload";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const id = body?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "id is required for update",
    });
  }

  try {
    const existing = await prisma.visitors.findUnique({ where: { id } });

    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Visitor tidak ditemukan.",
      });
    }

    const eventRecord = await getEventWithFields({ id: existing.eventId });

    if (!eventRecord) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Event tidak ditemukan.",
      });
    }

    const visitor = await updateVisitorForEvent(id, eventRecord, body);
    return flattenVisitor(visitor);
  } catch (error: unknown) {
    if (
      error instanceof VisitorValidationError ||
      error instanceof VisitorConflictError
    ) {
      const mapped = visitorHttpError(error);
      if (mapped) throw createError(mapped);
    }
    const err = error as { statusCode?: number };
    if (err.statusCode) throw error;
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat memperbarui data visitor.",
    });
  }
});
