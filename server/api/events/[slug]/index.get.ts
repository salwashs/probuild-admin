import * as Sentry from "@sentry/nuxt";
import { getEventWithFields } from "../../../utils/validateVisitorPayload";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

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

    return {
      slug: eventRecord.slug,
      name: eventRecord.name,
      description: eventRecord.description,
      isActive: eventRecord.isActive,
      startsAt: eventRecord.startsAt,
      endsAt: eventRecord.endsAt,
      fields: eventRecord.fields.map((field) => ({
        key: field.key,
        labelId: field.labelId,
        labelEn: field.labelEn,
        type: field.type,
        required: field.required,
        sortOrder: field.sortOrder,
        options: field.options,
        conditions: field.conditions,
        validation: field.validation,
      })),
    };
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err.statusCode) throw error;
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat mengambil data event.",
    });
  }
});
