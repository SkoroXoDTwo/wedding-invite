#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-a-belkov.ru}"
WWW_DOMAIN="${WWW_DOMAIN:-www.a-belkov.ru}"
APP_DIR="${APP_DIR:-/opt/wedding-invite}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/deploy.sh"
  exit 1
fi

cd "${APP_DIR}"

if [[ ! -f ".env.production" ]]; then
  if [[ ! -f ".env.production.example" ]]; then
    echo ".env.production.example not found. Did you pull the latest repo?"
    exit 1
  fi

  cp .env.production.example .env.production
  POSTGRES_PASSWORD="$(openssl rand -base64 24 | tr -d '\n')"
  ADMIN_PASSWORD="$(openssl rand -base64 18 | tr -d '\n')"
  AUTH_SECRET="$(openssl rand -hex 32)"

  sed -i "s#change-this-postgres-password#${POSTGRES_PASSWORD//\//\\/}#g" .env.production
  sed -i "s#change-this-admin-password#${ADMIN_PASSWORD//\//\\/}#g" .env.production
  sed -i "s#change-this-long-random-secret-at-least-32-chars#${AUTH_SECRET}#g" .env.production
  sed -i "s#https://a-belkov.ru#https://${DOMAIN}#g" .env.production
  sed -i "s#DOMAIN=a-belkov.ru#DOMAIN=${DOMAIN}#g" .env.production
  sed -i "s#WWW_DOMAIN=www.a-belkov.ru#WWW_DOMAIN=${WWW_DOMAIN}#g" .env.production
  sed -i "s#ACME_EMAIL=admin@a-belkov.ru#ACME_EMAIL=admin@${DOMAIN}#g" .env.production

  cat > .admin-credentials.txt <<CREDS
Admin URL: https://${DOMAIN}/admin/login
Admin email: admin@example.com
Admin password: ${ADMIN_PASSWORD}
CREDS
  chmod 600 .admin-credentials.txt
fi

docker compose up -d --build

echo "Waiting for app..."
for _ in {1..60}; do
  if docker compose exec -T app node -e "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"; then
    break
  fi
  sleep 1
done

echo "Deploy complete: https://${DOMAIN}"
if [[ -f .admin-credentials.txt ]]; then
  echo "Admin credentials saved in ${APP_DIR}/.admin-credentials.txt"
  cat .admin-credentials.txt
fi
