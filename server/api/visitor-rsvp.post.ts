import * as Sentry from "@sentry/nuxt";
import {
  createVisitorForEvent,
  getEventWithFields,
  softenFieldsForPublicRsvp,
  visitorHttpError,
  VisitorConflictError,
  VisitorValidationError,
} from "../utils/validateVisitorPayload";

const INTIM_SLUG = "probuild-intim-2026";

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));

  try {
    const eventRecord = await getEventWithFields({ slug: INTIM_SLUG });

    if (!eventRecord || !eventRecord.isActive) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Event tidak ditemukan atau tidak aktif.",
      });
    }

    const publicFields = softenFieldsForPublicRsvp(eventRecord.fields);

    const visitor = await createVisitorForEvent(
      { ...eventRecord, fields: publicFields },
      body || {},
    );

    setResponseStatus(event, 201);
    return {
      success: true,
      message: "Konfirmasi kehadiran tercatat.",
      registrationId: visitor.registrationId,
    };
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
      message: "Terjadi kesalahan server.",
      data: {
        success: false,
        message: "Terjadi kesalahan server.",
      },
    });
  }
});
