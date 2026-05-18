import { NextResponse } from "next/server";
import { createSessionToken, setAdminSessionCookie, verifyAdminCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };

  if (!verifyAdminCredentials(body.email ?? "", body.password ?? "")) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(setAdminSessionCookie(createSessionToken(body.email ?? "")));
  return response;
}
