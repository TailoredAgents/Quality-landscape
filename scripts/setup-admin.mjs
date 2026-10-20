import fs from "node:fs";
import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import dotenv from "dotenv";
const existing = fs.existsSync(".env.local")
  ? fs.readFileSync(".env.local", "utf8")
  : "";
const env = dotenv.parse(existing);
if (env.ADMIN_PASSWORD_HASH && !process.argv.includes("--rotate")) {
  console.log(
    "Administrator already configured. Use --rotate to replace credentials and invalidate existing sessions.",
  );
  process.exit(0);
}
const password = randomBytes(24).toString("base64url");
env.ADMIN_EMAIL = env.ADMIN_EMAIL || "admin@quality.local";
env.ADMIN_PASSWORD_HASH = await hash(password, 12);
env.SESSION_SECRET = randomBytes(48).toString("base64url");
env.PREVIEW_MODE = env.PREVIEW_MODE || "true";
env.NEXT_PUBLIC_SITE_URL = env.NEXT_PUBLIC_SITE_URL || "http://localhost:3107";
if (!env.DATABASE_URL) env.DB_MODE = "pglite";
fs.mkdirSync(".data", { recursive: true });
// Next.js expands $ references in .env files, including bcrypt hashes.
fs.writeFileSync(
  ".env.local",
  Object.entries(env)
    .map(
      ([k, v]) =>
        `${k}=${JSON.stringify(v.replace(/\\\$/g, "$")).replace(/\$/g, "\\$")}`,
    )
    .join("\n") + "\n",
  { mode: 0o600 },
);
fs.writeFileSync(
  ".data/admin-access.txt",
  `PRIVATE LOCAL ACCESS — DO NOT COMMIT OR SHARE\n\nURL: ${env.NEXT_PUBLIC_SITE_URL}/admin/login\nEmail: ${env.ADMIN_EMAIL}\nPassword: ${password}\n\nGenerated randomly for this local installation. Session lifetime: 8 hours.\nRun npm run admin:setup -- --rotate to rotate and invalidate all prior sessions.\n`,
  { mode: 0o600 },
);
console.log(
  "Secure local administrator configured. Read .data/admin-access.txt locally. No password has been printed.",
);
