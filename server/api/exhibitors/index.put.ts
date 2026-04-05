import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const {
    id,
    companyName,
    picName,
    email,
    phone,
    productType,
    boothTypeId,
    boothId,
    notes,
    isActive,
  } = body;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "id is required for update",
    });
  }

  const dataToUpdate: any = {};
  if (companyName !== undefined) dataToUpdate.companyName = companyName;
  if (picName !== undefined) dataToUpdate.picName = picName;
  if (email !== undefined) dataToUpdate.email = email;
  if (phone !== undefined) dataToUpdate.phone = phone;
  if (productType !== undefined) dataToUpdate.productType = productType;
  if (boothTypeId !== undefined) dataToUpdate.boothTypeId = boothTypeId;
  if (notes !== undefined) dataToUpdate.notes = notes;
  if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

  const transactions: any[] = [];

  if (boothId !== undefined) {
    // Ambil exhibitor yang ada untuk cek apakah booth lama perlu di-unbook
    const existingExhibitor = await prisma.exhibitors.findUnique({
      where: { id },
    });

    // Jika ada booth lama, set isBooked = false
    if (existingExhibitor?.boothId && existingExhibitor.boothId !== boothId) {
      transactions.push(
        prisma.booths.update({
          where: { id: existingExhibitor.boothId },
          data: { isBooked: false },
        }),
      );
    }

    dataToUpdate.boothId = boothId;

    // Mark booth baru sebagai booked (jika boothId bukan null)
    if (boothId) {
      transactions.push(
        prisma.booths.update({
          where: { id: boothId },
          data: { isBooked: true },
        }),
      );
    }
  }

  transactions.unshift(
    prisma.exhibitors.update({
      where: { id },
      data: dataToUpdate,
    }),
  );

  try {
    const [exhibitor] = await prisma.$transaction(transactions);

    return exhibitor;
  } catch (error) {
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat memperbarui data exhibitor.",
    });
  }
});
