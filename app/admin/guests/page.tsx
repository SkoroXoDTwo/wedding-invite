"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/components/admin-shell";
import type { AdminGuestRow } from "@/lib/types";

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<AdminGuestRow[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [salutation, setSalutation] = useState("");
  const [message, setMessage] = useState("");
  const [siteUrl, setSiteUrl] = useState(process.env.NEXT_PUBLIC_SITE_URL || "");

  async function loadGuests() {
    const response = await adminFetch("/api/admin/guests");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Не удалось загрузить гостей.");
    }

    setGuests(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    if (!siteUrl) {
      setSiteUrl(window.location.origin);
    }
    loadGuests().catch(() => setMessage("Не удалось загрузить гостей."));
  }, [siteUrl]);

  async function createGuest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await adminFetch("/api/admin/guests", {
      method: "POST",
      body: JSON.stringify({ displayName, salutation })
    });

    if (!response.ok) {
      setMessage("Не удалось создать гостя.");
      return;
    }

    setDisplayName("");
    setSalutation("");
    await loadGuests();
    setMessage("Гость создан.");
  }

  async function deleteGuest(id: string, name: string) {
    if (!window.confirm(`Удалить гостя "${name}"? Его ответ тоже удалится.`)) {
      return;
    }

    setMessage("");
    const response = await adminFetch(`/api/admin/guests?id=${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(data.error || "Не удалось удалить гостя.");
      return;
    }

    await loadGuests();
    setMessage("Гость удален.");
  }

  return (
    <>
      <form className="admin-panel" onSubmit={createGuest}>
        <h1>Гости и персональные ссылки</h1>
        <div className="admin-grid">
          <div className="form-field">
            <label>Имя гостя</label>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
          </div>
          <div className="form-field">
            <label>Персональное обращение</label>
            <input
              value={salutation}
              onChange={(event) => setSalutation(event.target.value)}
              placeholder="Дорогие Анна и Иван!"
            />
          </div>
          <div className="form-field" style={{ justifyContent: "end" }}>
            <button className="admin-btn" type="submit">
              Создать ссылку
            </button>
          </div>
        </div>
        <p className="form-status">{message}</p>
      </form>

      <section className="admin-panel" style={{ marginTop: 18 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Гость</th>
              <th>Обращение</th>
              <th>Ссылка</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => {
              const link = `${siteUrl}/invite/${guest.token}`;
              const latest = guest.rsvp_responses?.[0];
              return (
                <tr key={guest.id}>
                  <td>{guest.display_name}</td>
                  <td>{guest.salutation || "-"}</td>
                  <td>
                    <button className="admin-btn" type="button" onClick={() => navigator.clipboard.writeText(link)}>
                      Скопировать
                    </button>
                    <div style={{ marginTop: 8, wordBreak: "break-all" }}>{link}</div>
                  </td>
                  <td>{latest?.status ?? "Нет ответа"}</td>
                  <td>
                    <button
                      className="admin-btn danger"
                      type="button"
                      onClick={() => deleteGuest(guest.id, guest.display_name)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}
