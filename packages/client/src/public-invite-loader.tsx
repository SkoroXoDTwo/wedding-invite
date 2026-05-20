import { useEffect, useState } from "react";
import { defaultSettings, type EventSettings, type Guest, type RsvpResponse } from "@wedding-invite/shared";
import { InvitePage } from "./components/invite-page";

type InvitePayload = {
  settings: EventSettings;
  guest?: Guest;
  response?: RsvpResponse | null;
};

export function PublicInviteLoader({ token }: { token?: string }) {
  const [payload, setPayload] = useState<InvitePayload>({ settings: defaultSettings });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const url = token ? `/api/invite/${encodeURIComponent(token)}` : "/api/public/settings";

    fetch(url, {
      cache: "no-store",
      signal: controller.signal
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            setMessage("Персональная ссылка не найдена.");
          }
          throw new Error("Failed to load invite");
        }
        return response.json();
      })
      .then((data: EventSettings | InvitePayload) => {
        setMessage("");
        if ("settings" in data) {
          setPayload(data);
          return;
        }

        setPayload({ settings: data });
      })
      .catch(() => undefined);

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

  return <InvitePage settings={payload.settings} guest={payload.guest} response={payload.response ?? undefined} />;
}
