import fs from "node:fs";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import dotenv from "dotenv";
const env = dotenv.parse(fs.readFileSync(".env.local", "utf8"));
const password = randomBytes(30).toString("base64url");
const result = spawnSync(
  "docker",
  [
    "run",
    "--detach",
    "--name",
    "quality-landscape-postgres",
    "--env",
    "POSTGRES_DB=quality_landscape",
    "--env",
    "POSTGRES_USER=quality",
    "--env",
    "POSTGRES_PASSWORD",
    "--publish",
    "127.0.0.1:5547:5432",
    "--volume",
    "quality-landscape-pgdata:/var/lib/postgresql/data",
    "postgres:16",
  ],
  { encoding: "utf8", env: { ...process.env, POSTGRES_PASSWORD: password } },
);
if (result.status !== 0) {
  console.error(
    "Local PostgreSQL was not created. Check Docker for a container or port conflict.",
  );
  process.exit(1);
}
env.DATABASE_URL = `postgresql://quality:${password}@127.0.0.1:5547/quality_landscape`;
delete env.DB_MODE;
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
console.log(
  "Project PostgreSQL 16 is running locally on port 5547 with a persistent Docker volume. Connection saved privately in .env.local.",
);
