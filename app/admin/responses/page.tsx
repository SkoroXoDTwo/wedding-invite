"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/components/admin-shell";
import type { RsvpResponse } from "@/lib/types";

type ResponseRow = RsvpResponse & {
  guests?: {
    display_name: string;
    salutation: string | null;
    token: string;
  } | null;
};

const statusLabels: Record<string, string> = {
  attending: "Будет",
  declined: "Не будет",
  unknown: "Пока не знает"
};

export default function AdminResponsesPage() {
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [message, setMessage] = useState("");

  async function loadResponses() {
    const response = await adminFetch("/api/admin/responses");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Не удалось загрузить ответы.");
    }

    setResponses(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadResponses().catch((error) => setMessage(error instanceof Error ? error.message : "Не удалось загрузить ответы."));
  }, []);

  async function deleteResponse(id: string, guestName: string) {
    if (!window.confirm(`Удалить ответ гостя "${guestName}"?`)) {
      return;
    }

    setMessage("");
    const response = await adminFetch(`/api/admin/responses?id=${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(data.error || "Не удалось удалить ответ.");
      return;
    }

    await loadResponses();
    setMessage("Ответ удален.");
  }

  async function exportResponses() {
    setMessage("");
    const response = await adminFetch("/api/admin/responses?format=xlsx");

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error || "Не удалось выгрузить ответы.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wedding-responses.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="admin-panel">
      <div className="admin-section-head">
        <h1>Ответы гостей</h1>
        <button className="admin-btn" type="button" onClick={exportResponses}>
          Скачать Excel
        </button>
      </div>
      <p className="form-status">{message}</p>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Гость</th>
            <th>Статус</th>
            <th>+1</th>
            <th>Имена</th>
            <th>Обновлено</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((response) => {
            const guestName = response.guests?.display_name ?? "Общая ссылка";

            return (
              <tr key={response.id}>
                <td>{guestName}</td>
                <td>{statusLabels[response.status] ?? response.status}</td>
                <td>{response.plus_one ? "Да" : "Нет"}</td>
                <td>{response.entered_names}</td>
                <td>{new Date(response.updated_at).toLocaleString("ru-RU")}</td>
                <td>
                  <button
                    className="admin-btn danger"
                    type="button"
                    onClick={() => deleteResponse(response.id, guestName)}
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
  );
}
