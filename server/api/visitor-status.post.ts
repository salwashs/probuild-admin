import { prisma } from "../../lib/prisma";
import * as Sentry from "@sentry/nuxt";

const INTIM_SLUG = "probuild-intim-2026";

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizePhone(value: unknown): string {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

/**
 * POST /api/visitor-status
 * Public. Check if a visitor already registered for ProBuild INTIM 2026.
 * Body: { email } OR { whatsapp } (exactly one).
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  const email = normalizeEmail(body?.email);
  const whatsapp = normalizePhone(body?.whatsapp);

  const hasEmail = Boolean(email);
  const hasWhatsapp = Boolean(whatsapp);

  if (hasEmail === hasWhatsapp) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Kirim salah satu: email atau whatsapp.",
    });
  }

  if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Format email tidak valid.",
    });
  }

  if (hasWhatsapp && (whatsapp.length < 8 || whatsapp.length > 16)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Nomor WhatsApp tidak valid (8–16 digit).",
    });
  }

  try {
    const eventRecord = await prisma.events.findFirst({
      where: { slug: INTIM_SLUG },
      select: { id: true, isActive: true },
    });

    if (!eventRecord || !eventRecord.isActive) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Event tidak ditemukan atau tidak aktif.",
      });
    }

    const visitor = await prisma.visitors.findFirst({
      where: {
        eventId: eventRecord.id,
        ...(hasEmail ? { email } : { phone: whatsapp }),
      },
      select: {
        registrationId: true,
        fullName: true,
      },
    });

    if (!visitor) {
      return { found: false };
    }

    return {
      found: true,
      registrationId: visitor.registrationId,
      fullName: visitor.fullName,
    };
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err.statusCode) throw error;
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat cek status visitor.",
    });
  }
});
