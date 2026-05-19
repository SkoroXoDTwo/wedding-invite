#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-a-belkov.ru}"
WWW_DOMAIN="${WWW_DOMAIN:-www.a-belkov.ru}"
APP_DIR="${APP_DIR:-/opt/wedding-invite}"
APP_PORT="${APP_PORT:-3000}"

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
  sed -i "s#https://your-domain.example#https://${DOMAIN}#g" .env.production

  cat > .admin-credentials.txt <<CREDS
Admin URL: https://${DOMAIN}/admin/login
Admin email: admin@example.com
Admin password: ${ADMIN_PASSWORD}
CREDS
  chmod 600 .admin-credentials.txt
fi

docker compose up -d --build

cat > "/etc/nginx/sites-available/${DOMAIN}" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${WWW_DOMAIN};

    client_max_body_size 16m;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

ln -sfn "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "Waiting for app..."
for _ in {1..60}; do
  if curl -fsS "http://127.0.0.1:${APP_PORT}" >/dev/null; then
    break
  fi
  sleep 1
done

certbot --nginx -d "${DOMAIN}" -d "${WWW_DOMAIN}" --non-interactive --agree-tos --redirect --email "admin@${DOMAIN}" || {
  echo "Certbot failed. Check that DNS A records point to this server."
  echo "The app is still available over http://${DOMAIN}"
  exit 1
}

systemctl reload nginx

echo "Deploy complete: https://${DOMAIN}"
if [[ -f .admin-credentials.txt ]]; then
  echo "Admin credentials saved in ${APP_DIR}/.admin-credentials.txt"
  cat .admin-credentials.txt
fi
