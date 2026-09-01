import { prisma } from "../../../lib/prisma";

export default defineEventHandler(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const tables = await prisma.$queryRaw<Array<{ cnt: bigint }>>`
      SELECT COUNT(*) AS cnt FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = 'Users'
    `;
    const hasUsersTable = Number(tables[0]?.cnt ?? 0) > 0;

    return {
      ok: true,
      database: "connected",
      hasUsersTable,
    };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    return {
      ok: false,
      database: "error",
      code: err.code ?? null,
      message: err.message ?? "Unknown database error",
    };
  }
});
