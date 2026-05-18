import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  const admin = await assertAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: 401 });
  }

  try {
    const result = await query(
      `
        select
          r.*,
          case
            when g.id is null then null
            else jsonb_build_object(
              'display_name', g.display_name,
              'salutation', g.salutation,
              'token', g.token
            )
          end as guests
        from rsvp_responses r
        left join guests g on g.id = r.guest_id
        order by r.updated_at desc
      `
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Database error" }, { status: 500 });
  }
}
