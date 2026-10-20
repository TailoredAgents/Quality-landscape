import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import { query } from "./db";
import { digest, token, HttpError } from "./security";
export const sessionCookie = "quality_session";
export function credentialVersion() {
  return digest(
    `${process.env.ADMIN_EMAIL?.toLowerCase()}:${process.env.ADMIN_PASSWORD_HASH}`,
  );
}
export function authConfigured() {
  return (
    !!process.env.ADMIN_EMAIL &&
    /^\$2[aby]\$1[2-6]\$/.test(process.env.ADMIN_PASSWORD_HASH || "") &&
    (process.env.SESSION_SECRET?.length || 0) >= 32
  );
}
export async function validCredentials(email: string, password: string) {
  if (!authConfigured())
    throw new HttpError(
      503,
      "Administrator access needs local setup. See the project README.",
    );
  const valid = await compare(password, process.env.ADMIN_PASSWORD_HASH!);
  return (
    valid && email.toLowerCase() === process.env.ADMIN_EMAIL!.toLowerCase()
  );
}
export async function createSession() {
  const value = token();
  await query(
    "INSERT INTO admin_sessions(token_hash,credential_version,expires_at) VALUES($1,$2,now()+interval '8 hours')",
    [digest(value), credentialVersion()],
  );
  return value;
}
export async function sessionValid(value: string | undefined) {
  if (!value || !authConfigured() || !/^[A-Za-z0-9_-]{43}$/.test(value))
    return false;
  const rows = await query(
    "SELECT token_hash FROM admin_sessions WHERE token_hash=$1 AND credential_version=$2 AND expires_at>now()",
    [digest(value), credentialVersion()],
  );
  return rows.length === 1;
}
export async function isAuthenticated() {
  return sessionValid((await cookies()).get(sessionCookie)?.value);
}
export async function requireAdmin() {
  if (!(await isAuthenticated()))
    throw new HttpError(401, "Please sign in again.");
}
export async function invalidateSession(value: string | undefined) {
  if (value)
    await query("DELETE FROM admin_sessions WHERE token_hash=$1", [
      digest(value),
    ]);
}
