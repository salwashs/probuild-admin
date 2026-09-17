import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";
import { flattenVisitor } from "../../utils/validateVisitorPayload";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const registrationId =
    typeof body?.registrationId === "string"
      ? body.registrationId.trim()
      : "";

  if (!registrationId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "registrationId is required",
    });
  }

  try {
    const visitor = await prisma.visitors.findUnique({
      where: { registrationId },
      include: {
        event: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!visitor) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Visitor tidak ditemukan.",
      });
    }

    if (visitor.checkedInAt) {
      throw createError({
        statusCode: 409,
        statusMessage: "Conflict",
        message: "Visitor sudah check-in.",
        data: {
          success: false,
          message: "Visitor sudah check-in.",
          visitor: {
            ...flattenVisitor(visitor),
            event: visitor.event,
          },
        },
      });
    }

    const updated = await prisma.visitors.update({
      where: { id: visitor.id },
      data: { checkedInAt: new Date() },
      include: {
        event: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Check-in berhasil.",
      visitor: {
        ...flattenVisitor(updated),
        event: updated.event,
      },
    };
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err.statusCode) throw error;
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat check-in visitor.",
    });
  }
});
