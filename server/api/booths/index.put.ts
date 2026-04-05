import { prisma } from "../../../lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { id, number, boothTypeId, isBooked, isActive } = body;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "id is required for update",
    });
  }

  const dataToUpdate: any = {};
  if (number !== undefined) dataToUpdate.number = Number(number);
  if (boothTypeId !== undefined) dataToUpdate.boothTypeId = boothTypeId;
  if (isBooked !== undefined) dataToUpdate.isBooked = Boolean(isBooked);
  if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

  const booth = await prisma.booths.update({
    where: { id },
    data: dataToUpdate,
  });

  return booth;
});
