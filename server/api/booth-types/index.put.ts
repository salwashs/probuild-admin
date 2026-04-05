import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { id, name, size, price, isActive } = body;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "id is required for update",
    });
  }

  const dataToUpdate: any = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (size !== undefined) dataToUpdate.size = Number(size);
  if (price !== undefined) dataToUpdate.price = price != null ? Number(price) : null;
  if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

  try {
    const boothType = await prisma.boothTypes.update({
      where: { id },
      data: dataToUpdate,
    });

    return boothType;
  } catch (error) {
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat memperbarui tipe booth.",
    });
  }
});
