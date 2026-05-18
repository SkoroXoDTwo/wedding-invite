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

### Локально без Docker-приложения

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

## Docker-деплой

1. Скопируйте `.env.production.example` в `.env.production`.

```bash
cp .env.production.example .env.production
```

2. Заполните продакшен-переменные:

```env
POSTGRES_DB=wedding_invite
POSTGRES_USER=wedding_admin
POSTGRES_PASSWORD=strong-postgres-password
DATABASE_URL=postgresql://wedding_admin:strong-postgres-password@postgres:5432/wedding_invite
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=strong-admin-password
AUTH_SECRET=long-random-secret-at-least-32-chars
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

3. Соберите и запустите:

```bash
docker compose up -d --build
```

Приложение будет доступно на `http://SERVER_IP:3000`. Для домена обычно ставят Nginx/Caddy как reverse proxy на порт `3000`.

Контейнер приложения сам дождется PostgreSQL и применит `database/schema.sql`. Загруженные фото хранятся в Docker volume `wedding_invite_uploads`, база - в `wedding_invite_pgdata`.

Логи:

```bash
docker compose logs -f app
```

Обновление после изменений кода:

```bash
git pull
docker compose up -d --build
```

## Работа с сайтом

- Контент приглашения редактируется в `/admin/content`.
- Гости и персональные ссылки создаются в `/admin/guests`.
- Ответы гостей отображаются в `/admin/responses`.
- Персональная ссылка имеет формат `/invite/[token]`.

## Важное про референс

Визуал сделан как самостоятельная близкая реализация: композиция, ритм секций, анкета, таймер, адаптив и плавные появления повторяют настроение референса, но чужие фото, код и закрытые материалы не используются.
