import * as Sentry from "@sentry/nuxt";
import {
  createVisitorForEvent,
  getEventWithFields,
  softenFieldsForPublicRsvp,
  visitorHttpError,
  VisitorConflictError,
  VisitorValidationError,
} from "../../../utils/validateVisitorPayload";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const body = await readBody(event).catch(() => ({}));

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Slug event wajib diisi.",
    });
  }

  try {
    const eventRecord = await getEventWithFields({ slug });

    if (!eventRecord) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Event tidak ditemukan.",
      });
    }

    if (!eventRecord.isActive) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Event tidak aktif.",
      });
    }

    const visitor = await createVisitorForEvent(
      {
        ...eventRecord,
        fields: softenFieldsForPublicRsvp(eventRecord.fields),
      },
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
