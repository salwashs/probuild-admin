import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

/** Parse mysql://user:pass@host:port/db — handles special chars in password via last @ split */
function parseMysqlUrl(databaseUrl: string) {
  const stripped = databaseUrl.replace(/^mysql:\/\//, "");
  const atIndex = stripped.lastIndexOf("@");
  if (atIndex === -1) {
    throw new Error("Invalid DATABASE_URL format");
  }

  const credentials = stripped.slice(0, atIndex);
  const hostAndDb = stripped.slice(atIndex + 1);
  const colonIndex = credentials.indexOf(":");
  if (colonIndex === -1) {
    throw new Error("Invalid DATABASE_URL credentials");
  }

  const user = decodeURIComponent(credentials.slice(0, colonIndex));
  const password = decodeURIComponent(credentials.slice(colonIndex + 1));

  const slashIndex = hostAndDb.indexOf("/");
  if (slashIndex === -1) {
    throw new Error("Invalid DATABASE_URL host/database");
  }

  const hostPort = hostAndDb.slice(0, slashIndex);
  const database = decodeURIComponent(hostAndDb.slice(slashIndex + 1).split("?")[0]);
  const [host, portStr] = hostPort.includes(":")
    ? hostPort.split(":")
    : [hostPort, "3306"];

  return {
    host,
    port: Number(portStr) || 3306,
    user,
    password,
    database,
    connectionLimit: 5,
  };
}

function getMariaDbConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    return parseMysqlUrl(databaseUrl);
  }

  if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
    return {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME,
      connectionLimit: 5,
    };
  }

  throw new Error(
    "Database config missing: set DATABASE_URL or DB_HOST/DB_USER/DB_NAME",
  );
}

const adapter = new PrismaMariaDb(getMariaDbConfig());
const prisma = new PrismaClient({ adapter });

export { prisma };
