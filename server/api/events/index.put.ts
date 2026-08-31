import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";

type FieldInput = {
  key: string;
  labelId: string;
  labelEn?: string | null;
  type: string;
  required?: boolean;
  sortOrder?: number;
  showInTable?: boolean;
  indexAs?: string | null;
  uniquePerEvent?: boolean;
  validation?: unknown;
  options?: unknown;
  conditions?: unknown;
};

function mapFieldData(field: FieldInput) {
  if (!field.key || !field.labelId || !field.type) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Setiap field wajib memiliki key, labelId, dan type.",
    });
  }

  return {
    key: String(field.key),
    labelId: String(field.labelId),
    labelEn: field.labelEn ?? null,
    type: String(field.type),
    required: Boolean(field.required),
    sortOrder: Number(field.sortOrder ?? 0),
    showInTable: Boolean(field.showInTable),
    indexAs: field.indexAs ?? null,
    uniquePerEvent: Boolean(field.uniquePerEvent),
    validation: field.validation ?? undefined,
    options: field.options ?? undefined,
    conditions: field.conditions ?? undefined,
  };
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    id,
    slug,
    name,
    description,
    registrationPrefix,
    isActive,
    startsAt,
    endsAt,
    fields,
  } = body || {};

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "id is required for update",
    });
  }

  const dataToUpdate: Record<string, unknown> = {};
  if (slug !== undefined) dataToUpdate.slug = slug;
  if (name !== undefined) dataToUpdate.name = name;
  if (description !== undefined) dataToUpdate.description = description;
  if (registrationPrefix !== undefined) {
    dataToUpdate.registrationPrefix = registrationPrefix;
  }
  if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);
  if (startsAt !== undefined) {
    dataToUpdate.startsAt = startsAt ? new Date(startsAt) : null;
  }
  if (endsAt !== undefined) {
    dataToUpdate.endsAt = endsAt ? new Date(endsAt) : null;
  }

  try {
    if (Array.isArray(fields)) {
      await prisma.$transaction([
        prisma.eventFormFields.deleteMany({ where: { eventId: id } }),
        prisma.events.update({
          where: { id },
          data: {
            ...dataToUpdate,
            fields: {
              create: fields.map((field: FieldInput) => mapFieldData(field)),
            },
          },
        }),
      ]);
    } else {
      await prisma.events.update({
        where: { id },
        data: dataToUpdate,
      });
    }

    return prisma.events.findUnique({
      where: { id },
      include: { fields: { orderBy: { sortOrder: "asc" } } },
    });
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err.statusCode) throw error;
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat memperbarui data event.",
    });
  }
});
