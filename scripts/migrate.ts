import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { readFile } from "node:fs/promises";
import { database, closeDatabase } from "../src/lib/db";
const db = await database();
await db.exec(await readFile("migrations/001_initial.sql", "utf8"));
await closeDatabase();
console.log("Database migration 001 applied successfully.");
