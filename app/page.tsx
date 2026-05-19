import { PublicInviteLoader } from "@/components/public-invite-loader";
import { defaultSettings } from "@/lib/default-settings";

export default function HomePage() {
  return <PublicInviteLoader initialSettings={defaultSettings} />;
}
