# Wedding Invite Admin

Сайт электронного свадебного приглашения с персональными RSVP-ссылками и админкой.

## Что внутри

- `Next.js` app router.
- `PostgreSQL` через обычный `DATABASE_URL`.
- Собственная админ-сессия через httpOnly cookie.
- Публичные страницы:
  - `/`
  - `/invite`
  - `/invite/[token]`
- Админка:
  - `/admin/login`
  - `/admin`
  - `/admin/content`
  - `/admin/guests`
  - `/admin/responses`
- PostgreSQL:
  - `event_settings`
  - `guests`
  - `rsvp_responses`

## Запуск

1. Установите зависимости:

```bash
npm install
```

2. `.env` уже создан для локальной разработки. По умолчанию там стоят:

```env
DATABASE_URL=postgresql://wedding_admin:wedding_password@localhost:5433/wedding_invite
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin12345
AUTH_SECRET=local-dev-change-before-production-5c180b9a246d4fd4a6f22741c7a42ef7
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Запустите PostgreSQL через Docker:

```bash
docker compose up -d
```

Контейнер поднимет базу `wedding_invite` на порту `5433`, чтобы не конфликтовать с установленным у вас PostgreSQL.

4. Примените схему:

```bash
psql "postgresql://wedding_admin:wedding_password@localhost:5433/wedding_invite" -f database/schema.sql
```

5. Запустите проект:

```bash
npm run dev
```

6. Войдите в админку:

```text
Email: admin@example.com
Password: admin12345
```

Перед публикацией обязательно поменяйте `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET` и `NEXT_PUBLIC_SITE_URL`.

## Работа с сайтом

- Контент приглашения редактируется в `/admin/content`.
- Гости и персональные ссылки создаются в `/admin/guests`.
- Ответы гостей отображаются в `/admin/responses`.
- Персональная ссылка имеет формат `/invite/[token]`.

## Важное про референс

Визуал сделан как самостоятельная близкая реализация: композиция, ритм секций, анкета, таймер, адаптив и плавные появления повторяют настроение референса, но чужие фото, код и закрытые материалы не используются.
