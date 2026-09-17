import { prisma } from "../../../lib/prisma";
import * as Sentry from "@sentry/nuxt";
import { flattenVisitor } from "../../utils/validateVisitorPayload";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const registrationId =
    typeof query.registrationId === "string"
      ? query.registrationId.trim()
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

    return {
      ...flattenVisitor(visitor),
      event: visitor.event,
    };
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err.statusCode) throw error;
    Sentry.captureException(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Terjadi kesalahan saat mencari visitor.",
    });
  }
});
