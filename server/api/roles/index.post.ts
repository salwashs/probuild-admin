import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";

export default defineEventHandler(async (event) => {
  // Authorization: only super admin can create roles
  const auth = event.context.auth;
  if (!auth || auth.roleName !== "super admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Hanya Super Admin yang dapat menambahkan role.",
    });
  }

  const body = await readBody(event);

  const { name, description } = body;

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Nama role wajib diisi.",
    });
  }

  try {
    const role = await prisma.roles.create({
      data: {
        name,
        description: description || null,
      },
    });

    return role;
  } catch (error) {
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat menyimpan data role.",
    });
  }
});
