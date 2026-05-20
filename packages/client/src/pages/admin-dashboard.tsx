import { useEffect, useState } from "react";
import { adminFetch } from "../components/admin-shell";
import type { AdminGuestRow, RsvpResponse } from "@wedding-invite/shared";

export default function AdminDashboardPage() {
  const [guests, setGuests] = useState<AdminGuestRow[]>([]);
  const [responses, setResponses] = useState<RsvpResponse[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([adminFetch("/api/admin/guests"), adminFetch("/api/admin/responses")])
      .then(async ([guestRes, responseRes]) => {
        const guestData = await guestRes.json();
        const responseData = await responseRes.json();

        if (!guestRes.ok || !responseRes.ok) {
          throw new Error(guestData.error || responseData.error || "Admin API error");
        }

        setGuests(Array.isArray(guestData) ? guestData : []);
        setResponses(Array.isArray(responseData) ? responseData : []);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Не удалось загрузить данные."));
  }, []);

  const safeResponses = Array.isArray(responses) ? responses : [];
  const attending = safeResponses.filter((item) => item.status === "attending").length;
  const declined = safeResponses.filter((item) => item.status === "declined").length;

  return (
    <>
      <h1>Обзор</h1>
      {message ? <p className="form-status">{message}</p> : null}
      <div className="admin-grid">
        <section className="admin-panel">
          <h2>{guests.length}</h2>
          <p>персональных гостей</p>
          <a href="/admin/guests">Управлять гостями</a>
        </section>
        <section className="admin-panel">
          <h2>{attending}</h2>
          <p>ответили, что будут</p>
          <a href="/admin/responses">Смотреть ответы</a>
        </section>
        <section className="admin-panel">
          <h2>{declined}</h2>
          <p>ответили, что не смогут</p>
          <a href="/admin/content">Редактировать сайт</a>
        </section>
      </div>
    </>
  );
}
