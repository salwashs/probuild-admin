import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { number, boothTypeId, isBooked, isActive } = body;

  if (number === undefined || !boothTypeId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "number and boothTypeId are required",
    });
  }

  try {
    const booth = await prisma.booths.create({
      data: {
        number: Number(number),
        boothTypeId,
        isBooked: isBooked ?? false,
        isActive: isActive ?? true,
      },
    });

    return booth;
  } catch (error) {
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat menyimpan data booth.",
    });
  }
});
