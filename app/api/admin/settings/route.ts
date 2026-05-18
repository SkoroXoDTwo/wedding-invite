import { NextResponse } from "next/server";
import { getEventSettings, saveEventSettings } from "@/lib/settings";
import { assertAdmin } from "@/lib/auth";
import type { EventSettings } from "@/lib/types";

export async function GET(request: Request) {
  const admin = await assertAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: 401 });
  }

  return NextResponse.json(await getEventSettings());
}

export async function PUT(request: Request) {
  const admin = await assertAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: 401 });
  }

  const body = (await request.json()) as EventSettings;

  if (!body.coupleNames || !body.weddingDate) {
    return NextResponse.json({ error: "coupleNames and weddingDate are required" }, { status: 400 });
  }

  try {
    await saveEventSettings(body);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
