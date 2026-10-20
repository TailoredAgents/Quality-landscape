import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { invalidateSession, sessionCookie } from "@/lib/auth";
import { assertOrigin, apiError } from "@/lib/security";
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    await invalidateSession((await cookies()).get(sessionCookie)?.value);
    const response = NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(sessionCookie, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
