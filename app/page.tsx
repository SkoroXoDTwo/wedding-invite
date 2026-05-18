import { InvitePage } from "@/components/invite-page";
import { getEventSettings } from "@/lib/settings";

export default async function HomePage() {
  const settings = await getEventSettings();

  return <InvitePage settings={settings} />;
}
