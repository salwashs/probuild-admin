import { prisma } from "../../../lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const {
    companyName,
    picName,
    email,
    phone,
    productType,
    boothTypeId,
    notes,
    isActive,
  } = body;

  if (
    !companyName ||
    !picName ||
    !email ||
    !phone ||
    !productType ||
    !boothTypeId
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message:
        "companyName, picName, email, phone, productType, and boothTypeId are required",
    });
  }

  // Cek apakah booth type ada dan aktif
  const boothType = await prisma.boothTypes.findUnique({
    where: { id: boothTypeId },
  });

  if (!boothType || !boothType.isActive) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Tipe booth tidak ditemukan atau tidak aktif",
    });
  }

  // Cek apakah masih ada booth dengan tipe tersebut yang tersedia
  const availableBooth = await prisma.booths.findFirst({
    where: {
      boothTypeId,
      isBooked: false,
      isActive: true,
    },
  });

  if (!availableBooth) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Tidak ada booth tipe "${boothType.name}" yang tersedia`,
    });
  }

  // Buat exhibitor tanpa assign booth spesifik (admin yang assign nanti)
  const exhibitor = await prisma.exhibitors.create({
    data: {
      companyName,
      picName,
      email,
      phone,
      productType,
      boothTypeId,
      notes: notes || null,
      isActive: isActive ?? true,
    },
  });

  return exhibitor;
});
