import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import path from "node:path";
type Connection = {
  query: <T>(sql: string, args?: unknown[]) => Promise<{ rows: T[] }>;
  exec: (sql: string) => Promise<unknown>;
  close: () => Promise<void>;
};
const globalDb = globalThis as unknown as { qualityDb?: Promise<Connection> };
async function openDatabase(): Promise<Connection> {
  if (process.env.DATABASE_URL) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      ssl:
        process.env.DATABASE_SSL === "true"
          ? { rejectUnauthorized: true }
          : undefined,
    });
    return {
      query: async <T>(sql: string, args: unknown[] = []) => ({
        rows: (await pool.query(sql, args)).rows as T[],
      }),
      exec: (sql) => pool.query(sql),
      close: () => pool.end(),
    };
  }
  if (
    process.env.DB_MODE === "pglite" &&
    process.env.NODE_ENV !== "production"
  ) {
    const db = new PGlite(
      process.env.LOCAL_DATABASE_PATH ||
        path.join(process.cwd(), ".data", "postgres"),
    );
    await db.waitReady;
    await db.exec(
      await readFile(
        path.join(process.cwd(), "migrations", "001_initial.sql"),
        "utf8",
      ),
    );
    return {
      query: async <T>(sql: string, args: unknown[] = []) => ({
        rows: (await db.query(sql, args)).rows as T[],
      }),
      exec: (sql) => db.exec(sql),
      close: () => db.close(),
    };
  }
  throw new Error(
    "Persistent database is not configured. Set DATABASE_URL, or use DB_MODE=pglite only in local development.",
  );
}
export function database() {
  if (!globalDb.qualityDb)
    globalDb.qualityDb = openDatabase().catch((e) => {
      globalDb.qualityDb = undefined;
      throw e;
    });
  return globalDb.qualityDb;
}
export async function query<T = Record<string, unknown>>(
  sql: string,
  args: unknown[] = [],
): Promise<T[]> {
  return (await (await database()).query<T>(sql, args)).rows;
}
export async function closeDatabase() {
  if (globalDb.qualityDb) {
    await (await globalDb.qualityDb).close();
    globalDb.qualityDb = undefined;
  }
}
