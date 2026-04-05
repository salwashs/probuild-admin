import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { name, size, price, isActive } = body;

  if (!name || size === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "name and size are required",
    });
  }

  try {
    const boothType = await prisma.boothTypes.create({
      data: {
        name,
        size: Number(size),
        price: price != null ? Number(price) : null,
        isActive: isActive ?? true,
      },
    });

    return boothType;
  } catch (error) {
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat menyimpan tipe booth.",
    });
  }
});
