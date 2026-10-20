import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { query, closeDatabase } from "../src/lib/db";
const days = (name: string, fallback: number) => {
  const n = Number(process.env[name] || fallback);
  if (!Number.isInteger(n) || n < 1 || n > 3650)
    throw new Error(`Invalid retention: ${name}`);
  return n;
};
await query(
  "DELETE FROM analytics_events WHERE created_at < now() - ($1 * interval '1 day')",
  [days("ANALYTICS_RETENTION_DAYS", 90)],
);
await query(
  "DELETE FROM inquiries WHERE created_at < now() - ($1 * interval '1 day')",
  [days("INQUIRY_RETENTION_DAYS", 365)],
);
await query("DELETE FROM admin_sessions WHERE expires_at < now()");
await query("DELETE FROM rate_limits WHERE expires_at < now()");
await closeDatabase();
console.log("Configured retention policy applied.");
