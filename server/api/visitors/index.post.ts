import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { fullName, phone, company, position, email } = body;

  if (!fullName || !phone || !company || !email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "fullName, phone, email, and company are required",
    });
  }

  // Generate a dummy email if not provided, to satisfy the database schema
  const visitorEmail = email || `no-email-${Date.now()}@probuild.com`;

  try {
    const visitor = await prisma.visitors.create({
      data: {
        fullName,
        phone,
        company,
        position: position || null,
        email: visitorEmail,
      },
    });

    return visitor;
  } catch (error) {
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat menyimpan data visitor.",
    });
  }
});
