"use client";

import { useEffect, useState } from "react";
import { InvitePage } from "@/components/invite-page";
import type { EventSettings } from "@/lib/types";

export function PublicInviteLoader({ initialSettings }: { initialSettings: EventSettings }) {
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/public/settings", {
      cache: "no-store",
      signal: controller.signal
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load settings");
        }
        return response.json();
      })
      .then((data: EventSettings) => setSettings(data))
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  return <InvitePage settings={settings} />;
}
