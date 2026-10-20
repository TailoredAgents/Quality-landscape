import { NextResponse } from "next/server";
import { z } from "zod";
import { validCredentials, createSession, sessionCookie } from "@/lib/auth";
import {
  assertOrigin,
  readJson,
  rateLimit,
  clientKey,
  digest,
  apiError,
  HttpError,
} from "@/lib/security";
import { query } from "@/lib/db";
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const data = z
      .object({
        email: z.email().max(254),
        password: z.string().min(1).max(128),
      })
      .safeParse(await readJson(request, 3000));
    if (!data.success)
      throw new HttpError(400, "Enter your administrator email and password.");
    await rateLimit(`login-ip:${clientKey(request)}`, 25, 900);
    const accountBucket = `login-account:${digest(data.data.email.toLowerCase())}`;
    await rateLimit(accountBucket, 5, 900);
    if (!(await validCredentials(data.data.email, data.data.password)))
      throw new HttpError(401, "The email or password is incorrect.");
    await query("DELETE FROM rate_limits WHERE bucket=$1", [accountBucket]);
    const value = await createSession();
    const response = NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(sessionCookie, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
