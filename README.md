# Wedding Invite Admin

Сайт электронного свадебного приглашения с персональными RSVP-ссылками и админкой.

## Что внутри

- `React` + `Vite` frontend в `packages/client`.
- `Express` API и static hosting в `packages/server`.
- Общие TypeScript-типы и дефолтный контент в `packages/shared`.
- `PostgreSQL` через `DATABASE_URL`.
- Собственная админ-сессия через httpOnly cookie.
- Публичные страницы: `/`, `/invite`, `/invite/[token]`.
- Админка: `/admin/login`, `/admin`, `/admin/content`, `/admin/guests`, `/admin/responses`.

## Запуск локально

1. Установите зависимости:

```bash
npm install
```

2. Проверьте `.env`:

```env
DATABASE_URL=postgresql://wedding_admin:wedding_password@localhost:5433/wedding_invite
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin12345
AUTH_SECRET=local-dev-change-before-production-5c180b9a246d4fd4a6f22741c7a42ef7
SITE_URL=http://localhost:3000
```

3. Запустите PostgreSQL:

```bash
docker compose up -d postgres
```

4. Примените схему:

```bash
psql "postgresql://wedding_admin:wedding_password@localhost:5433/wedding_invite" -f database/schema.sql
```

5. Соберите и запустите приложение:

```bash
npm run build
npm run start
```

Приложение будет доступно на `http://localhost:3000`.

## Docker-деплой

1. Скопируйте `.env.production.example` в `.env.production`.
2. Заполните `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `SITE_URL`.
3. Соберите и запустите:

```bash
docker compose up -d --build
```

Контейнер приложения сам дождется PostgreSQL и применит `database/schema.sql`. Загруженные фото хранятся в Docker volume `wedding_invite_uploads`, база - в `wedding_invite_pgdata`.

## Проверки

```bash
npm run typecheck
npm run build
npm run lint
```

HTML и API отдаются с `Cache-Control: no-store`, а Vite assets - с долгим immutable-кэшем, чтобы мобильные браузеры не держали старые данные сайта.
