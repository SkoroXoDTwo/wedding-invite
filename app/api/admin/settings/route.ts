import { NextResponse } from "next/server";
import { getEventSettings, saveEventSettings } from "@/lib/settings";
import { assertAdmin } from "@/lib/auth";
import type { EventSettings } from "@/lib/types";

function getErrorPayload(error: unknown) {
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message =
      typeof record.message === "string" && record.message.trim()
        ? record.message
        : "Не удалось сохранить настройки";

    return {
      error: message,
      code: typeof record.code === "string" ? record.code : undefined,
      detail: typeof record.detail === "string" ? record.detail : undefined
    };
  }

  return { error: "Не удалось сохранить настройки" };
}

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

  let body: EventSettings;

  try {
    body = (await request.json()) as EventSettings;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON в настройках" }, { status: 400 });
  }

  if (!body.coupleNames || !body.weddingDate) {
    return NextResponse.json({ error: "Заполните имена пары и дату свадьбы" }, { status: 400 });
  }

  try {
    await saveEventSettings(body);
  } catch (error) {
    console.error("Failed to save event settings", error);
    return NextResponse.json(getErrorPayload(error), { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
