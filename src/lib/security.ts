import { createHmac, randomBytes } from "node:crypto";
import { query } from "./db";
import { siteUrl } from "./config";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32)
    throw new HttpError(503, "Secure access is not configured yet.");
  return value;
}
export function digest(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}
export function token() {
  return randomBytes(32).toString("base64url");
}
export function assertOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin !== new URL(siteUrl).origin)
    throw new HttpError(403, "This request origin is not allowed.");
  if (request.headers.get("sec-fetch-site") === "cross-site")
    throw new HttpError(403, "Cross-site requests are not allowed.");
}
export async function readJson(request: Request, maxBytes = 16384) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "Send a JSON request.");
  if (Number(request.headers.get("content-length") || 0) > maxBytes)
    throw new HttpError(413, "The request is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Request data is missing.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, "The request is too large.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "The request is not valid JSON.");
  }
}
export function clientKey(request: Request) {
  // Only trust Render's proxy headers when explicitly enabled. Never persist raw IPs.
  const address =
    process.env.TRUST_PROXY === "true"
      ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown"
      : "local";
  return digest(`rate:${address}`);
}
export async function rateLimit(bucket: string, max: number, seconds: number) {
  const rows = await query<{ hits: number }>(
    `INSERT INTO rate_limits(bucket,hits,expires_at) VALUES($1,1,now()+($2 * interval '1 second')) ON CONFLICT(bucket) DO UPDATE SET hits=CASE WHEN rate_limits.expires_at<now() THEN 1 ELSE rate_limits.hits+1 END, expires_at=CASE WHEN rate_limits.expires_at<now() THEN now()+($2 * interval '1 second') ELSE rate_limits.expires_at END RETURNING hits`,
    [bucket, seconds],
  );
  if (rows[0].hits > max)
    throw new HttpError(429, "Too many attempts. Please wait and try again.");
}
export function apiError(error: unknown) {
  if (error instanceof HttpError)
    return Response.json(
      { error: error.message },
      {
        status: error.status,
        headers: {
          "Cache-Control": "no-store",
          ...(error.status === 429 ? { "Retry-After": "900" } : {}),
        },
      },
    );
  console.error(
    "Request failed:",
    error instanceof Error ? error.name : "UnknownError",
  );
  return Response.json(
    {
      error:
        "The service is temporarily unavailable. Please try again shortly.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
export function noStore(data: unknown) {
  return Response.json(data, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
