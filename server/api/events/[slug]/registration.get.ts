import * as Sentry from "@sentry/nuxt";
import {
  findVisitorByDeviceId,
  getEventWithFields,
  normalizeDeviceId,
  VisitorValidationError,
  visitorHttpError,
} from "../../../utils/validateVisitorPayload";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const query = getQuery(event);

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Slug event wajib diisi.",
    });
  }

  try {
    const rawDeviceId = Array.isArray(query.deviceId)
      ? query.deviceId[0]
      : query.deviceId;
    const deviceId = normalizeDeviceId(rawDeviceId, true);
    const eventRecord = await getEventWithFields({ slug });

    if (!eventRecord) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Event tidak ditemukan.",
      });
    }

    const existing = deviceId
      ? await findVisitorByDeviceId(eventRecord.id, deviceId)
      : null;

    if (!existing) {
      return { registered: false };
    }

    return {
      registered: true,
      registrationId: existing.registrationId,
      fullName: existing.fullName,
      submittedAt: existing.submittedAt ?? existing.createdAt,
    };
  } catch (error: unknown) {
    if (error instanceof VisitorValidationError) {
      const mapped = visitorHttpError(error);
      if (mapped) throw createError(mapped);
    }
    const err = error as { statusCode?: number };
    if (err.statusCode) throw error;
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat memeriksa status registrasi.",
    });
  }
});
