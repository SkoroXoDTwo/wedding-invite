import { useEffect, useState } from "react";
import { type EventSettings, type Guest, type RsvpResponse } from "@wedding-invite/shared";
import { InvitePage } from "./components/invite-page";

type InvitePayload = {
  settings: EventSettings;
  guest?: Guest;
  response?: RsvpResponse | null;
};

function normalizeInvitePayload(data: EventSettings | InvitePayload): InvitePayload {
  if ("settings" in data) {
    return data;
  }

  return { settings: data };
}

function preloadCoverImage(url?: string) {
  if (!url) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
  });
}

export function PublicInviteLoader({ token }: { token?: string }) {
  const [payload, setPayload] = useState<InvitePayload | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const url = token ? `/api/invite/${encodeURIComponent(token)}` : "/api/public/settings";

    async function loadInvite() {
      try {
        const response = await fetch(url, {
          cache: "no-store",
          signal: controller.signal
        });

        if (!response.ok) {
          if (response.status === 404) {
            setMessage("Персональная ссылка не найдена.");
          }
          throw new Error("Failed to load invite");
        }

        const data = (await response.json()) as EventSettings | InvitePayload;
        const nextPayload = normalizeInvitePayload(data);

        await preloadCoverImage(nextPayload.settings.coverImageUrl);
        if (controller.signal.aborted) {
          return;
        }

        setMessage("");
        setPayload(nextPayload);
      } catch {
        return;
      }
    }

    void loadInvite();

    return () => controller.abort();
  }, [token]);

  if (message) {
    return (
      <main className="invite-page">
        <section className="section compact">
          <h1 className="section-title">{message}</h1>
        </section>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="invite-loading-page" aria-busy="true">
        <div className="invite-loading-mark" aria-hidden="true" />
      </main>
    );
  }

  return <InvitePage settings={payload.settings} guest={payload.guest} response={payload.response ?? undefined} />;
}
