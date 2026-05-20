import { useEffect, useState } from "react";
import { defaultSettings, type ContactItem, type DetailItem, type EventSettings, type TimelineItem } from "@wedding-invite/shared";
import { adminFetch } from "../components/admin-shell";

function toDateTimeLocal(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatHeroDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

export default function AdminContentPage() {
  const [settings, setSettings] = useState<EventSettings>(defaultSettings);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    adminFetch("/api/admin/settings")
      .then((response) => response.json())
      .then((data: EventSettings) => {
        setSettings({
          ...defaultSettings,
          ...data,
          timeline: data.timeline ?? defaultSettings.timeline,
          details: data.details ?? defaultSettings.details,
          contacts: data.contacts ?? defaultSettings.contacts,
          initials: data.initials ?? defaultSettings.initials,
          rsvp: {
            ...defaultSettings.rsvp,
            ...data.rsvp
          },
          dressCode: {
            ...defaultSettings.dressCode,
            ...data.dressCode
          }
        });
      })
      .catch(() => setMessage("Не удалось загрузить настройки."));
  }, []);

  function patch<K extends keyof EventSettings>(key: K, value: EventSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function patchTimeline(index: number, patch: Partial<TimelineItem>) {
    setSettings((current) => ({
      ...current,
      timeline: current.timeline.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    }));
  }

  function addTimelineItem() {
    setSettings((current) => ({
      ...current,
      timeline: [...current.timeline, { time: "", title: "", description: "" }]
    }));
  }

  function removeTimelineItem(index: number) {
    setSettings((current) => ({
      ...current,
      timeline: current.timeline.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  function patchDetail(index: number, patch: Partial<DetailItem>) {
    setSettings((current) => ({
      ...current,
      details: current.details.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    }));
  }

  function addDetail() {
    setSettings((current) => ({
      ...current,
      details: [...current.details, { title: "", text: "" }]
    }));
  }

  function removeDetail(index: number) {
    setSettings((current) => ({
      ...current,
      details: current.details.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  function patchContact(index: number, patch: Partial<ContactItem>) {
    setSettings((current) => ({
      ...current,
      contacts: current.contacts.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      )
    }));
  }

  function addContact() {
    setSettings((current) => ({
      ...current,
      contacts: [...current.contacts, { role: "", name: "", phone: "" }]
    }));
  }

  function removeContact(index: number) {
    setSettings((current) => ({
      ...current,
      contacts: current.contacts.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  function updateWeddingDate(value: string) {
    const isoDate = value ? new Date(value).toISOString() : "";

    setSettings((current) => ({
      ...current,
      weddingDate: isoDate,
      heroDateLabel: isoDate ? formatHeroDate(isoDate) : current.heroDateLabel
    }));
  }

  async function uploadCover(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await adminFetch("/api/admin/upload", {
      method: "POST",
      body: formData
    });
    const data = await response.json();

    setIsUploading(false);

    if (!response.ok) {
      setMessage(data.error || "Не удалось загрузить фото.");
      return;
    }

    patch("coverImageUrl", data.url);
    setMessage("Фото загружено. Нажмите «Сохранить», чтобы применить его на сайте.");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const payload: EventSettings = {
        ...defaultSettings,
        ...settings,
        timeline: (settings.timeline ?? []).filter((item) => item.time || item.title || item.description),
        details: (settings.details ?? []).filter((item) => item.title || item.text),
        contacts: (settings.contacts ?? []).filter((item) => item.role || item.name || item.phone),
        rsvp: {
          ...defaultSettings.rsvp,
          ...settings.rsvp
        },
        dressCode: {
          ...defaultSettings.dressCode,
          ...settings.dressCode
        }
      };

      const response = await adminFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      const errorText = [result.error, result.code, result.detail].filter(Boolean).join(": ");

      setMessage(response.ok ? "Настройки сохранены." : errorText || `Не удалось сохранить настройки. HTTP ${response.status}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить настройки.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="admin-panel" onSubmit={save}>
      <h1>Контент приглашения</h1>
      <div className="admin-grid">
        <div className="form-field">
          <label>Имена пары</label>
          <input value={settings.coupleNames} onChange={(event) => patch("coupleNames", event.target.value)} />
        </div>
        <div className="form-field">
          <label>Левая инициала</label>
          <input
            maxLength={2}
            value={settings.initials[0] ?? ""}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                initials: [event.target.value.toUpperCase(), current.initials[1] ?? ""]
              }))
            }
          />
        </div>
        <div className="form-field">
          <label>Правая инициала</label>
          <input
            maxLength={2}
            value={settings.initials[1] ?? ""}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                initials: [current.initials[0] ?? "", event.target.value.toUpperCase()]
              }))
            }
          />
        </div>
      </div>

      <div className="admin-grid">
        <div className="form-field">
          <label>Дата и время свадьбы</label>
          <input
            type="datetime-local"
            value={toDateTimeLocal(settings.weddingDate)}
            onChange={(event) => updateWeddingDate(event.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Дата на обложке</label>
          <input value={settings.heroDateLabel} onChange={(event) => patch("heroDateLabel", event.target.value)} />
        </div>
      </div>

      <div className="admin-grid">
        <div className="form-field">
          <label>Цвет акцента</label>
          <input value={settings.accentColor} onChange={(event) => patch("accentColor", event.target.value)} />
        </div>
        <div className="form-field">
          <label>Цвет фона</label>
          <input value={settings.backgroundColor} onChange={(event) => patch("backgroundColor", event.target.value)} />
        </div>
        <div className="form-field">
          <label>URL изображения обложки</label>
          <input value={settings.coverImageUrl ?? ""} onChange={(event) => patch("coverImageUrl", event.target.value)} />
        </div>
      </div>

      <div className="admin-upload">
        <div className="cover-preview">
          {settings.coverImageUrl ? (
            <img src={settings.coverImageUrl} alt="Текущая обложка" />
          ) : (
            <span>Фото обложки пока не выбрано</span>
          )}
        </div>
        <div className="form-field">
          <label>Загрузить фото обложки файлом</label>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadCover} />
          <small>{isUploading ? "Загружаем..." : "JPG, PNG, WebP или GIF до 8 МБ"}</small>
        </div>
      </div>

      <div className="form-field">
        <label>Заголовок обращения</label>
        <input value={settings.guestHeading} onChange={(event) => patch("guestHeading", event.target.value)} />
      </div>
      <div className="form-field">
        <label>Вступительный текст</label>
        <textarea value={settings.introText} onChange={(event) => patch("introText", event.target.value)} />
      </div>

      <div className="admin-grid">
        <div className="form-field">
          <label>Локация - заголовок</label>
          <input value={settings.venueTitle} onChange={(event) => patch("venueTitle", event.target.value)} />
        </div>
        <div className="form-field">
          <label>Адрес</label>
          <input value={settings.venueAddress} onChange={(event) => patch("venueAddress", event.target.value)} />
        </div>
        <div className="form-field">
          <label>Embed URL карты</label>
          <input value={settings.mapEmbedUrl} onChange={(event) => patch("mapEmbedUrl", event.target.value)} />
        </div>
      </div>

      <div className="form-field">
        <label>Описание локации</label>
        <textarea value={settings.venueText} onChange={(event) => patch("venueText", event.target.value)} />
      </div>

      <div className="admin-grid">
        <div className="form-field">
          <label>ЗАГС - заголовок</label>
          <input value={settings.registryTitle} onChange={(event) => patch("registryTitle", event.target.value)} />
        </div>
        <div className="form-field">
          <label>Адрес ЗАГСа</label>
          <input value={settings.registryAddress} onChange={(event) => patch("registryAddress", event.target.value)} />
        </div>
        <div className="form-field">
          <label>Embed URL карты ЗАГСа</label>
          <input value={settings.registryMapEmbedUrl} onChange={(event) => patch("registryMapEmbedUrl", event.target.value)} />
        </div>
      </div>

      <div className="form-field">
        <label>Описание ЗАГСа</label>
        <textarea value={settings.registryText} onChange={(event) => patch("registryText", event.target.value)} />
      </div>

      <section className="admin-editor-section">
        <div className="admin-section-head">
          <h2>Программа дня</h2>
          <button className="admin-btn ghost" type="button" onClick={addTimelineItem}>
            Добавить пункт
          </button>
        </div>
        {settings.timeline.map((item, index) => (
          <div className="admin-repeat-card" key={index}>
            <div className="admin-grid">
              <div className="form-field">
                <label>Время</label>
                <input value={item.time} onChange={(event) => patchTimeline(index, { time: event.target.value })} />
              </div>
              <div className="form-field">
                <label>Заголовок</label>
                <input value={item.title} onChange={(event) => patchTimeline(index, { title: event.target.value })} />
              </div>
              <div className="form-field repeat-actions">
                <button className="admin-btn ghost" type="button" onClick={() => removeTimelineItem(index)}>
                  Удалить
                </button>
              </div>
            </div>
            <div className="form-field">
              <label>Описание</label>
              <textarea value={item.description} onChange={(event) => patchTimeline(index, { description: event.target.value })} />
            </div>
          </div>
        ))}
      </section>

      <section className="admin-editor-section">
        <div className="admin-section-head">
          <h2>Детали</h2>
          <button className="admin-btn ghost" type="button" onClick={addDetail}>
            Добавить деталь
          </button>
        </div>
        {settings.details.map((item, index) => (
          <div className="admin-repeat-card" key={index}>
            <div className="admin-grid">
              <div className="form-field">
                <label>Заголовок, необязательно</label>
                <input value={item.title ?? ""} onChange={(event) => patchDetail(index, { title: event.target.value })} />
              </div>
              <div className="form-field repeat-actions">
                <button className="admin-btn ghost" type="button" onClick={() => removeDetail(index)}>
                  Удалить
                </button>
              </div>
            </div>
            <div className="form-field">
              <label>Текст</label>
              <textarea value={item.text} onChange={(event) => patchDetail(index, { text: event.target.value })} />
            </div>
          </div>
        ))}
      </section>

      <section className="admin-editor-section">
        <h2>RSVP</h2>
        <div className="admin-grid">
          <div className="form-field">
            <label>Заголовок блока RSVP</label>
            <input
              value={settings.rsvp.title}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  rsvp: { ...current.rsvp, title: event.target.value }
                }))
              }
            />
          </div>
          <div className="form-field">
            <label>Текст срока ответа</label>
            <input
              value={settings.rsvp.deadlineText}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  rsvp: { ...current.rsvp, deadlineText: event.target.value }
                }))
              }
              placeholder="Будем ждать ответ до 15.10.2026 г."
            />
          </div>
        </div>
      </section>

      <section className="admin-editor-section">
        <div className="admin-section-head">
          <h2>Контакты</h2>
          <button className="admin-btn ghost" type="button" onClick={addContact}>
            Добавить контакт
          </button>
        </div>
        {settings.contacts.map((item, index) => (
          <div className="admin-repeat-card" key={index}>
            <div className="admin-grid">
              <div className="form-field">
                <label>Роль</label>
                <input value={item.role} onChange={(event) => patchContact(index, { role: event.target.value })} />
              </div>
              <div className="form-field">
                <label>Имя</label>
                <input value={item.name} onChange={(event) => patchContact(index, { name: event.target.value })} />
              </div>
              <div className="form-field">
                <label>Телефон</label>
                <input
                  value={item.phone ?? ""}
                  onChange={(event) => patchContact(index, { phone: event.target.value })}
                  placeholder="+7 900 000-00-00"
                />
              </div>
            </div>
            <div className="form-field repeat-actions">
              <button className="admin-btn ghost" type="button" onClick={() => removeContact(index)}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </section>

      <div className="form-field">
        <label>Финальный текст</label>
        <input value={settings.finalText} onChange={(event) => patch("finalText", event.target.value)} />
      </div>
      <button className="admin-btn" type="submit" disabled={isSaving}>
        {isSaving ? "Сохраняем..." : "Сохранить"}
      </button>
      <p className="form-status">{message}</p>
    </form>
  );
}
