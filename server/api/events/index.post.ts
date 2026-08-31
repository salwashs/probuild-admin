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
    slug,
    name,
    description,
    registrationPrefix,
    isActive,
    startsAt,
    endsAt,
    fields,
  } = body || {};

  if (!slug || !name || !registrationPrefix) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "slug, name, dan registrationPrefix wajib diisi.",
    });
  }

  try {
    const existing = await prisma.events.findUnique({ where: { slug } });
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: "Conflict",
        message: "Slug event sudah digunakan.",
      });
    }

    const created = await prisma.events.create({
      data: {
        slug,
        name,
        description: description || null,
        registrationPrefix,
        isActive: isActive ?? true,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        fields: Array.isArray(fields)
          ? { create: fields.map((field: FieldInput) => mapFieldData(field)) }
          : undefined,
      },
      include: {
        fields: { orderBy: { sortOrder: "asc" } },
      },
    });

    return created;
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err.statusCode) throw error;
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat menyimpan data event.",
    });
  }
});
