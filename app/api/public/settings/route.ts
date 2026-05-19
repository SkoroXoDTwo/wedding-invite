import { NextResponse } from "next/server";
import { getEventSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getEventSettings();

  return NextResponse.json(settings, {
    headers: {
      "cache-control": "no-store"
    }
  });
}
