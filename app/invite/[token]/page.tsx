import { notFound } from "next/navigation";
import { InvitePage } from "@/components/invite-page";
import { getEventSettings } from "@/lib/settings";
import { query } from "@/lib/db";
import type { Guest, RsvpResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function PersonalizedInvitePage({ params }: Props) {
  const { token } = await params;
  const settings = await getEventSettings();
  const guestResult = await query<Guest>("select * from guests where token = $1 limit 1", [token]);
  const guest = guestResult.rows[0];

  if (!guest) {
    notFound();
  }

  const responseResult = await query<RsvpResponse>(
    "select * from rsvp_responses where guest_id = $1 limit 1",
    [guest.id]
  );

  return <InvitePage settings={settings} guest={guest} response={responseResult.rows[0]} />;
}
