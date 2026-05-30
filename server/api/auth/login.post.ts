import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Email dan password wajib diisi.",
    });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "Email atau password salah.",
      });
    }

    // Compare password — support both bcrypt hashed and plain text (legacy)
    let isPasswordValid = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plain text password comparison
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "Email atau password salah.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "fallback-secret";

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roleName: user.role.name,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie
    setCookie(event, "auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Return user info (without password)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat login.",
    });
  }
});
