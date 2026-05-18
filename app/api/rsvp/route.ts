import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { AttendanceStatus } from "@/lib/types";

type RsvpBody = {
  token?: string;
  status?: AttendanceStatus;
  plusOne?: boolean;
  enteredNames?: string;
  drinkPreferences?: string[];
};

const allowedStatuses = new Set(["attending", "declined", "unknown"]);

export async function POST(request: Request) {
  const body = (await request.json()) as RsvpBody;

  if (!body.status || !allowedStatuses.has(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (!body.enteredNames?.trim()) {
    return NextResponse.json({ error: "Names are required" }, { status: 400 });
  }

  let guestId: string | null = null;

  if (body.token) {
    const guestResult = await query<{ id: string }>("select id from guests where token = $1 limit 1", [
      body.token
    ]);
    const guest = guestResult.rows[0];

    if (!guest) {
      return NextResponse.json({ error: "Guest link not found" }, { status: 404 });
    }

    guestId = guest.id;
  }

  try {
    if (guestId) {
      await query(
        `
          insert into rsvp_responses (guest_id, status, plus_one, entered_names, drink_preferences)
          values ($1, $2, $3, $4, $5)
          on conflict (guest_id)
          do update set
            status = excluded.status,
            plus_one = excluded.plus_one,
            entered_names = excluded.entered_names,
            drink_preferences = excluded.drink_preferences,
            updated_at = now()
        `,
        [guestId, body.status, Boolean(body.plusOne), body.enteredNames.trim(), body.drinkPreferences ?? []]
      );
    } else {
      await query(
        `
          insert into rsvp_responses (guest_id, status, plus_one, entered_names, drink_preferences)
          values (null, $1, $2, $3, $4)
        `,
        [body.status, Boolean(body.plusOne), body.enteredNames.trim(), body.drinkPreferences ?? []]
      );
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
