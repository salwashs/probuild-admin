import { prisma } from "../../../lib/prisma";

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

  const boothType = await prisma.boothTypes.create({
    data: {
      name,
      size: Number(size),
      price: price != null ? Number(price) : null,
      isActive: isActive ?? true,
    },
  });

  return boothType;
});
