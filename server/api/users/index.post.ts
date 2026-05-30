import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";
import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
  // Authorization: only admin or super admin can create users
  const auth = event.context.auth;
  if (!auth || (auth.roleName !== "super admin" && auth.roleName !== "admin")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Hanya Admin atau Super Admin yang dapat menambahkan user.",
    });
  }

  const body = await readBody(event);

  const { name, email, password, roleId } = body;

  if (!email || !password || !roleId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Email, password, dan role wajib diisi.",
    });
  }

  try {
    // Check the target role name
    const targetRole = await prisma.roles.findUnique({
      where: { id: roleId },
    });

    if (!targetRole) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Role tidak ditemukan.",
      });
    }

    // Admin cannot assign super admin role
    if (
      auth.roleName === "admin" &&
      targetRole.name.toLowerCase() === "super admin"
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Admin tidak dapat mendaftarkan user sebagai Super Admin.",
      });
    }

    // Check if email already exists
    const existing = await prisma.users.findUnique({
      where: { email },
    });

    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: "Conflict",
        message: "Email sudah terdaftar.",
      });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        roleId,
      },
      include: {
        role: true,
      },
    });

    // Return without password
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat menyimpan data user.",
    });
  }
});
