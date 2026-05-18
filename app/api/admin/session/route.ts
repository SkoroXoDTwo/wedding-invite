import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await assertAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
