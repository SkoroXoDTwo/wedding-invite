import { defaultSettings, type EventSettings } from "@wedding-invite/shared";
import { query } from "./db.js";

const SETTINGS_ID = "main";

export async function getEventSettings(): Promise<EventSettings> {
  try {
    const result = await query<{ content: Partial<EventSettings> }>(
      "select content from event_settings where id = $1 limit 1",
      [SETTINGS_ID]
    );

    if (!result.rows[0]?.content) {
      return defaultSettings;
    }

    return {
      ...defaultSettings,
      ...result.rows[0].content
    };
  } catch {
    return defaultSettings;
  }
}

export async function saveEventSettings(content: EventSettings) {
  return query(
    `
      insert into event_settings (id, content)
      values ($1, $2::jsonb)
      on conflict (id)
      do update set content = excluded.content, updated_at = now()
    `,
    [SETTINGS_ID, JSON.stringify(content)]
  );
}
