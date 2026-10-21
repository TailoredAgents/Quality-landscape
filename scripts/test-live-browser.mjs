import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const root = process.cwd();
const checkout = await fs.mkdtemp(path.join(root, ".data", "production-qa-"));
for (const name of [
  "src",
  "public",
  "migrations",
  "package.json",
  "tsconfig.json",
  "next-env.d.ts",
  "next.config.ts",
  "postcss.config.mjs",
])
  await fs.cp(path.join(root, name), path.join(checkout, name), {
    recursive: true,
  });
await fs.symlink(
  path.join(root, "node_modules"),
  path.join(checkout, "node_modules"),
  "junction",
);
const environment = {
  ...process.env,
  PREVIEW_MODE: "false",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3108",
  SITE_URL: "http://localhost:3108",
};
async function command(args, cwd, env) {
  const process = spawn(globalThis.process.execPath, args, {
    cwd,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  process.stdout.on("data", (data) => {
    log += data;
  });
  process.stderr.on("data", (data) => {
    log += data;
  });
  const code = await new Promise((resolve, reject) => {
    process.once("exit", resolve);
    process.once("error", reject);
  });
  if (code !== 0) throw new Error(`QA command failed (exit ${code}). ${log}`);
  return log;
}
console.log(
  "Building an isolated live-mode copy for aggregate analytics and privacy browser checks. The presentation build stays unchanged.",
);
await command(
  ["node_modules/next/dist/bin/next", "build", "--webpack"],
  checkout,
  environment,
);
console.log(
  await command(
    ["node_modules/tsx/dist/cli.mjs", "scripts/test-backend.ts"],
    root,
    { ...environment, QA_APP_DIR: checkout, QA_LIVE_BROWSER: "true" },
  ),
);
