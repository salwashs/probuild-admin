import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const id = body?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "id is required for delete",
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

    await prisma.visitors.delete({ where: { id } });

    return {
      success: true,
      message: "Visitor berhasil dihapus.",
      id,
    };
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err.statusCode) throw error;
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat menghapus data visitor.",
    });
  }
});
