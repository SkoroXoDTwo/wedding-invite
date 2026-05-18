import { NextResponse } from "next/server";
import { createGuestToken } from "@/lib/tokens";
import { assertAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import type { AdminGuestRow, RsvpResponse } from "@/lib/types";

export async function GET(request: Request) {
  const admin = await assertAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: 401 });
  }

  try {
    const result = await query<
      AdminGuestRow & { rsvp_responses: RsvpResponse[] | null }
    >(
      `
        select
          g.*,
          coalesce(
            jsonb_agg(to_jsonb(r) order by r.updated_at desc) filter (where r.id is not null),
            '[]'::jsonb
          ) as rsvp_responses
        from guests g
        left join rsvp_responses r on r.guest_id = g.id
        group by g.id
        order by g.created_at desc
      `
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await assertAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: 401 });
  }

  const body = (await request.json()) as { displayName?: string; salutation?: string };

  if (!body.displayName?.trim()) {
    return NextResponse.json({ error: "displayName is required" }, { status: 400 });
  }

  try {
    const result = await query<AdminGuestRow>(
      `
        insert into guests (display_name, salutation, token)
        values ($1, $2, $3)
        returning *
      `,
      [body.displayName.trim(), body.salutation?.trim() || null, createGuestToken()]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Database error" }, { status: 500 });
  }
}
