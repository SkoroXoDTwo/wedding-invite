import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import cookieParser from "cookie-parser";
import express from "express";
import multer from "multer";
import { type AttendanceStatus, type EventSettings, type Guest, type RsvpResponse } from "@wedding-invite/shared";
import {
  clearAdminSessionCookie,
  createSessionToken,
  requireAdmin,
  setAdminSessionCookie,
  verifyAdminCredentials
} from "./auth.js";
import { query } from "./db.js";
import { getEventSettings, saveEventSettings } from "./settings.js";
import { createGuestToken } from "./tokens.js";
import { buildResponseRows, createWorkbook } from "./xlsx.js";
import { loadDotEnv } from "./env.js";

loadDotEnv();

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = resolve(process.cwd());
const clientDir = resolve(rootDir, "packages/client/dist");
const uploadsDir = resolve(rootDir, "public/uploads");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});
const allowedUploadTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const allowedStatuses = new Set(["attending", "declined", "unknown"]);

app.disable("x-powered-by");
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

app.use("/api", (_request, response, next) => {
  response.setHeader("Cache-Control", "no-store");
  next();
});

app.use(
  "/assets",
  express.static(join(clientDir, "assets"), {
    immutable: true,
    maxAge: "1y"
  })
);

app.use(
  "/uploads",
  express.static(uploadsDir, {
    maxAge: "1h",
    setHeaders(response) {
      response.setHeader("Cache-Control", "public, max-age=3600");
    }
  })
);

app.use(
  "/fonts",
  express.static(join(rootDir, "public/fonts"), {
    maxAge: "1y",
    immutable: true
  })
);

function sendError(response: express.Response, error: unknown, fallback = "Database error") {
  response.status(500).json({ error: error instanceof Error ? error.message : fallback });
}

function getUploadExtension(file: Express.Multer.File) {
  const fromName = extname(file.originalname).toLowerCase();

  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(fromName)) {
    return fromName;
  }

  if (file.mimetype === "image/jpeg") return ".jpg";
  if (file.mimetype === "image/png") return ".png";
  if (file.mimetype === "image/webp") return ".webp";
  if (file.mimetype === "image/gif") return ".gif";

  return "";
}

app.get("/api/health", async (_request, response) => {
  try {
    await query("select 1");
    response.json({ ok: true });
  } catch (error) {
    sendError(response, error);
  }
});

app.get("/api/public/settings", async (_request, response) => {
  response.json(await getEventSettings());
});

app.get("/api/invite/:token", async (request, response) => {
  try {
    const settings = await getEventSettings();
    const guestResult = await query<Guest>("select * from guests where token = $1 limit 1", [request.params.token]);
    const guest = guestResult.rows[0];

    if (!guest) {
      response.status(404).json({ error: "Guest link not found" });
      return;
    }

    const responseResult = await query<RsvpResponse>("select * from rsvp_responses where guest_id = $1 limit 1", [
      guest.id
    ]);

    response.json({ settings, guest, response: responseResult.rows[0] ?? null });
  } catch (error) {
    sendError(response, error);
  }
});

app.post("/api/rsvp", async (request, response) => {
  const body = request.body as {
    token?: string;
    status?: AttendanceStatus;
    plusOne?: boolean;
    enteredNames?: string;
    drinkPreferences?: string[];
  };

  if (!body.status || !allowedStatuses.has(body.status)) {
    response.status(400).json({ error: "Invalid status" });
    return;
  }

  if (!body.enteredNames?.trim()) {
    response.status(400).json({ error: "Names are required" });
    return;
  }

  try {
    let guestId: string | null = null;

    if (body.token) {
      const guestResult = await query<{ id: string }>("select id from guests where token = $1 limit 1", [body.token]);
      const guest = guestResult.rows[0];

      if (!guest) {
        response.status(404).json({ error: "Guest link not found" });
        return;
      }

      guestId = guest.id;
    }

    if (guestId) {
      await query(
        `
          insert into rsvp_responses (guest_id, status, plus_one, entered_names, drink_preferences)
          values ($1, $2, $3, $4, $5)
          on conflict (guest_id)
          do update set
            status = excluded.status,
            plus_one = excluded.plus_one,
            entered_names = excluded.entered_names,
            drink_preferences = excluded.drink_preferences,
            updated_at = now()
        `,
        [guestId, body.status, Boolean(body.plusOne), body.enteredNames.trim(), body.drinkPreferences ?? []]
      );
    } else {
      await query(
        `
          insert into rsvp_responses (guest_id, status, plus_one, entered_names, drink_preferences)
          values (null, $1, $2, $3, $4)
        `,
        [body.status, Boolean(body.plusOne), body.enteredNames.trim(), body.drinkPreferences ?? []]
      );
    }

    response.json({ ok: true });
  } catch (error) {
    sendError(response, error);
  }
});

app.post("/api/admin/login", (request, response) => {
  const body = request.body as { email?: string; password?: string };

  if (!verifyAdminCredentials(body.email ?? "", body.password ?? "")) {
    response.status(401).json({ error: "Invalid credentials" });
    return;
  }

  setAdminSessionCookie(response, createSessionToken(body.email ?? ""));
  response.json({ ok: true });
});

app.post("/api/admin/logout", (_request, response) => {
  clearAdminSessionCookie(response);
  response.json({ ok: true });
});

app.get("/api/admin/session", (request, response) => {
  if (!requireAdmin(request, response)) return;
  response.json({ ok: true });
});

app.get("/api/admin/settings", async (request, response) => {
  if (!requireAdmin(request, response)) return;
  response.json(await getEventSettings());
});

app.put("/api/admin/settings", async (request, response) => {
  if (!requireAdmin(request, response)) return;

  const body = request.body as EventSettings;
  if (!body.coupleNames || !body.weddingDate) {
    response.status(400).json({ error: "Заполните имена пары и дату свадьбы" });
    return;
  }

  try {
    await saveEventSettings(body);
    response.json({ ok: true });
  } catch (error) {
    console.error("Failed to save event settings", error);
    sendError(response, error, "Не удалось сохранить настройки");
  }
});

app.get("/api/admin/guests", async (request, response) => {
  if (!requireAdmin(request, response)) return;

  try {
    const result = await query(
      `
        select
          g.*,
          coalesce(
            jsonb_agg(to_jsonb(r) order by r.updated_at desc) filter (where r.id is not null),
            '[]'::jsonb
          ) as rsvp_responses
        from guests g
        left join rsvp_responses r on r.guest_id = g.id
        group by g.id
        order by g.created_at desc
      `
    );

    response.json(result.rows);
  } catch (error) {
    sendError(response, error);
  }
});

app.post("/api/admin/guests", async (request, response) => {
  if (!requireAdmin(request, response)) return;

  const body = request.body as { displayName?: string; salutation?: string };
  if (!body.displayName?.trim()) {
    response.status(400).json({ error: "displayName is required" });
    return;
  }

  try {
    const result = await query(
      `
        insert into guests (display_name, salutation, token)
        values ($1, $2, $3)
        returning *
      `,
      [body.displayName.trim(), body.salutation?.trim() || null, createGuestToken()]
    );

    response.json(result.rows[0]);
  } catch (error) {
    sendError(response, error);
  }
});

app.delete("/api/admin/guests", async (request, response) => {
  if (!requireAdmin(request, response)) return;

  const id = typeof request.query.id === "string" ? request.query.id : "";
  if (!id) {
    response.status(400).json({ error: "guest id is required" });
    return;
  }

  try {
    const result = await query("delete from guests where id = $1 returning id", [id]);

    if (!result.rowCount) {
      response.status(404).json({ error: "Гость не найден" });
      return;
    }

    response.json({ ok: true });
  } catch (error) {
    sendError(response, error);
  }
});

app.get("/api/admin/responses", async (request, response) => {
  if (!requireAdmin(request, response)) return;

  try {
    const result = await query(
      `
        select
          r.*,
          case
            when g.id is null then null
            else jsonb_build_object(
              'display_name', g.display_name,
              'salutation', g.salutation,
              'token', g.token
            )
          end as guests
        from rsvp_responses r
        left join guests g on g.id = r.guest_id
        order by r.updated_at desc
      `
    );

    if (request.query.format === "xlsx") {
      response
        .type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        .attachment("wedding-responses.xlsx")
        .send(createWorkbook(buildResponseRows(result.rows)));
      return;
    }

    response.json(result.rows);
  } catch (error) {
    sendError(response, error);
  }
});

app.delete("/api/admin/responses", async (request, response) => {
  if (!requireAdmin(request, response)) return;

  const id = typeof request.query.id === "string" ? request.query.id : "";
  if (!id) {
    response.status(400).json({ error: "response id is required" });
    return;
  }

  try {
    const result = await query("delete from rsvp_responses where id = $1 returning id", [id]);

    if (!result.rowCount) {
      response.status(404).json({ error: "Ответ не найден" });
      return;
    }

    response.json({ ok: true });
  } catch (error) {
    sendError(response, error);
  }
});

app.post("/api/admin/upload", upload.single("file"), async (request, response) => {
  if (!requireAdmin(request, response)) return;

  const file = request.file;
  if (!file) {
    response.status(400).json({ error: "Файл не найден" });
    return;
  }

  if (!allowedUploadTypes.has(file.mimetype)) {
    response.status(400).json({ error: "Можно загружать только JPG, PNG, WebP или GIF" });
    return;
  }

  const extension = getUploadExtension(file);
  if (!extension) {
    response.status(400).json({ error: "Не удалось определить тип изображения" });
    return;
  }

  await mkdir(uploadsDir, { recursive: true });
  const filename = `cover-${Date.now()}-${randomUUID()}${extension}`;
  await writeFile(join(uploadsDir, filename), file.buffer);
  response.json({ url: `/uploads/${filename}` });
});

app.get("/favicon.svg", (_request, response) => {
  response.setHeader("Cache-Control", "public, max-age=3600");
  response.sendFile(join(rootDir, "public/favicon.svg"));
});

app.use((request, response, next) => {
  if (request.method !== "GET" || request.path.startsWith("/api/")) {
    next();
    return;
  }

  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  response.sendFile(join(clientDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Wedding invite server is running on http://localhost:${port}`);
});
