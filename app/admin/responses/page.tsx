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

  useEffect(() => {
    adminFetch("/api/admin/responses")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Не удалось загрузить ответы.");
        }
        setResponses(Array.isArray(data) ? data : []);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Не удалось загрузить ответы."));
  }, []);

  return (
    <section className="admin-panel">
      <h1>Ответы гостей</h1>
      <p className="form-status">{message}</p>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Гость</th>
            <th>Статус</th>
            <th>+1</th>
            <th>Имена</th>
            <th>Обновлено</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((response) => (
            <tr key={response.id}>
              <td>{response.guests?.display_name ?? "Общая ссылка"}</td>
              <td>{statusLabels[response.status] ?? response.status}</td>
              <td>{response.plus_one ? "Да" : "Нет"}</td>
              <td>{response.entered_names}</td>
              <td>{new Date(response.updated_at).toLocaleString("ru-RU")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
