import { PublicInviteLoader } from "@/components/public-invite-loader";
import { defaultSettings } from "@/lib/default-settings";

export default function InviteIndexPage() {
  return <PublicInviteLoader initialSettings={defaultSettings} />;
}
