import { InvitePage } from "@/components/invite-page";
import { getEventSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function InviteIndexPage() {
  const settings = await getEventSettings();

  return <InvitePage settings={settings} />;
}
