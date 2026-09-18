import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";
import {
  INTIM_2026_EVENT,
  INTIM_2026_FIELDS,
} from "../../../prisma/intim-2026-fields";

/**
 * POST /api/events/sync-intim-fields
 * Admin-only. Replaces EventFormFields for probuild-intim-2026 from code.
 * Does NOT delete Visitors rows.
 */
export default defineEventHandler(async (event) => {
  const auth = event.context.auth as
    | { roleName?: string }
    | undefined;

  if (
    !auth ||
    (auth.roleName !== "super admin" && auth.roleName !== "admin")
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Hanya admin yang dapat sync field event.",
    });
  }

  try {
    const intimEvent = await prisma.events.upsert({
      where: { slug: INTIM_2026_EVENT.slug },
      update: {
        name: INTIM_2026_EVENT.name,
        description: INTIM_2026_EVENT.description,
        registrationPrefix: INTIM_2026_EVENT.registrationPrefix,
        isActive: INTIM_2026_EVENT.isActive,
      },
      create: {
        slug: INTIM_2026_EVENT.slug,
        name: INTIM_2026_EVENT.name,
        description: INTIM_2026_EVENT.description,
        registrationPrefix: INTIM_2026_EVENT.registrationPrefix,
        isActive: INTIM_2026_EVENT.isActive,
      },
    });

    await prisma.eventFormFields.deleteMany({
      where: { eventId: intimEvent.id },
    });

    await prisma.eventFormFields.createMany({
      data: INTIM_2026_FIELDS.map((field) => ({
        eventId: intimEvent.id,
        key: field.key,
        labelId: field.labelId,
        labelEn: field.labelEn,
        type: field.type,
        required: field.required,
        sortOrder: field.sortOrder,
        showInTable: field.showInTable,
        indexAs: field.indexAs,
        uniquePerEvent: field.uniquePerEvent,
        validation:
          "validation" in field
            ? JSON.parse(JSON.stringify(field.validation))
            : undefined,
        options:
          "options" in field
            ? JSON.parse(JSON.stringify(field.options))
            : undefined,
        conditions:
          "conditions" in field
            ? JSON.parse(JSON.stringify(field.conditions))
            : undefined,
      })),
    });

    const fields = await prisma.eventFormFields.findMany({
      where: { eventId: intimEvent.id },
      orderBy: { sortOrder: "asc" },
      select: { key: true, required: true, showInTable: true },
    });

    // #region agent log
    fetch('http://127.0.0.1:7366/ingest/b4c9394e-995b-4ebb-be2d-e3f30facecf0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a40deb'},body:JSON.stringify({sessionId:'a40deb',runId:'post-fix',hypothesisId:'A',location:'sync-intim-fields.post.ts',message:'Synced intim fields',data:{fieldCount:fields.length,required:fields.filter(f=>f.required).map(f=>f.key)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    return {
      success: true,
      message: "EventFormFields synced. Visitors data tidak dihapus.",
      eventId: intimEvent.id,
      fieldCount: fields.length,
      required: fields.filter((f) => f.required).map((f) => f.key),
      showInTable: fields.filter((f) => f.showInTable).map((f) => f.key),
    };
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err.statusCode) throw error;
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Gagal sync EventFormFields.",
    });
  }
});
