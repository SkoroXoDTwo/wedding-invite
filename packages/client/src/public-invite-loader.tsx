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
  const [isPageReady, setIsPageReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const url = token ? `/api/invite/${encodeURIComponent(token)}` : "/api/public/settings";
    setPayload(null);
    setIsPageReady(false);
    setMessage("");

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
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsPageReady(true));
        });
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
      <InviteLoadingScreen isHidden={false} />
    );
  }

  return (
    <>
      <div className={`invite-reveal-shell${isPageReady ? " is-ready" : ""}`}>
        <InvitePage settings={payload.settings} guest={payload.guest} response={payload.response ?? undefined} />
      </div>
      <InviteLoadingScreen isHidden={isPageReady} />
    </>
  );
}

function InviteLoadingScreen({ isHidden }: { isHidden: boolean }) {
  return (
    <div className={`invite-loading-page${isHidden ? " is-hidden" : ""}`} aria-busy={!isHidden}>
      <div className="invite-loading-content">
        <div className="invite-loading-title">Алексей и Надежда</div>
        <div className="invite-loading-initials" aria-hidden="true">
          <span>А</span>
          <i />
          <span>Н</span>
        </div>
        <div className="invite-loading-mark" aria-hidden="true" />
      </div>
    </div>
  );
}
