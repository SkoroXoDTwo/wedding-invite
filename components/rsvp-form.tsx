"use client";

import { useState } from "react";
import type { AttendanceStatus, EventSettings, Guest, RsvpResponse } from "@/lib/types";

type Props = {
  settings: EventSettings;
  guest?: Guest;
  response?: RsvpResponse;
};

const labels: Record<AttendanceStatus, string> = {
  attending: "Я приду / Мы придем",
  declined: "Прийти не получится",
  unknown: "Пока не знаю"
};

export function RsvpForm({ settings, guest, response }: Props) {
  const [status, setStatus] = useState<AttendanceStatus>(response?.status ?? "attending");
  const [plusOne, setPlusOne] = useState(response?.plus_one ?? false);
  const [enteredNames, setEnteredNames] = useState(
    response?.entered_names ?? guest?.display_name ?? ""
  );
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const result = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token: guest?.token,
        status,
        plusOne,
        enteredNames: guest?.display_name ?? enteredNames,
        drinkPreferences: []
      })
    });

    setIsSaving(false);

    if (!result.ok) {
      setMessage("Не получилось отправить ответ. Попробуйте еще раз.");
      return;
    }

    setMessage("Спасибо! Ваш ответ сохранен.");
  }

  return (
    <form className="rsvp-card" onSubmit={onSubmit}>
      <p className="lead" style={{ marginBottom: 18 }}>
        Ваши ответы на вопросы очень помогут нам при организации свадьбы.
        <br />
        {settings.rsvp.deadlineText}
      </p>

      <div className="form-field">
        <span className="field-label">Сможете ли вы присутствовать?</span>
        <div className="choice-grid">
          {(Object.keys(labels) as AttendanceStatus[]).map((item) => (
            <button
              type="button"
              key={item}
              className={`pill-choice ${status === item ? "active" : ""}`}
              onClick={() => setStatus(item)}
            >
              {labels[item]}
            </button>
          ))}
        </div>
      </div>

      <label className={`plus-one-choice ${plusOne ? "active" : ""}`}>
        <input
          type="checkbox"
          checked={plusOne}
          onChange={(event) => setPlusOne(event.target.checked)}
        />
        <span aria-hidden="true" />
        <strong>Буду +1</strong>
      </label>

      {guest ? null : (
        <div className="form-field">
          <label htmlFor="names">Имя Фамилия</label>
          <textarea
            id="names"
            value={enteredNames}
            onChange={(event) => setEnteredNames(event.target.value)}
            placeholder="Если вы будете парой или семьей, внесите все имена и фамилии"
            required
          />
        </div>
      )}

      <button className="submit-btn" type="submit" disabled={isSaving}>
        {isSaving ? "Отправляем..." : "Отправить"}
      </button>
      <div className="form-status" role="status">
        {message}
      </div>
    </form>
  );
}
