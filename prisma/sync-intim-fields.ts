/**
 * Sync EventFormFields for probuild-intim-2026 from intim-2026-fields.ts.
 *
 * SAFE for existing data:
 * - Only replaces rows in EventFormFields (definisi form).
 * - NEVER deletes or updates Visitors / payload / check-in.
 *
 * Usage:
 *   pnpm prisma:sync-intim
 *   npx tsx prisma/sync-intim-fields.ts
 *
 * Production (hPanel SSH): jalankan sekali setelah deploy yang mengubah field.
 * Atau pakai POST /api/events/sync-intim-fields (admin login).
 */
import { prisma } from "../lib/prisma";
import { INTIM_2026_EVENT, INTIM_2026_FIELDS } from "./intim-2026-fields";

async function main() {
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

  const visitorsBefore = await prisma.visitors.count({
    where: { eventId: intimEvent.id },
  });

  // Hanya definisi form — bukan data pendaftar.
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

  const visitorsAfter = await prisma.visitors.count({
    where: { eventId: intimEvent.id },
  });

  if (visitorsAfter !== visitorsBefore) {
    throw new Error(
      `ABORT: jumlah Visitors berubah (${visitorsBefore} → ${visitorsAfter}). Sync field tidak boleh menyentuh Visitors.`,
    );
  }

  const fields = await prisma.eventFormFields.findMany({
    where: { eventId: intimEvent.id },
    orderBy: { sortOrder: "asc" },
    select: { key: true, required: true, showInTable: true },
  });

  console.log(
    JSON.stringify(
      {
        success: true,
        message:
          "EventFormFields synced. Visitors tidak diubah/dihapus.",
        eventId: intimEvent.id,
        visitorsPreserved: visitorsAfter,
        fieldCount: fields.length,
        required: fields.filter((f) => f.required).map((f) => f.key),
        showInTable: fields.filter((f) => f.showInTable).map((f) => f.key),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
