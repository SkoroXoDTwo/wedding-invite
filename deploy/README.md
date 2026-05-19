# Server Deploy

These scripts target a clean Ubuntu/Debian VPS.

## 1. DNS

In the domain control panel, point records to the server IP:

```text
A     @      SERVER_IP
A     www    SERVER_IP
```

Wait until:

```bash
dig +short A a-belkov.ru
```

returns the server IP.

## 2. Install server dependencies

On the server:

```bash
apt update
apt install -y git
cd /opt
git clone https://github.com/SkoroXoDTwo/wedding-invite.git
cd wedding-invite
bash deploy/server-setup.sh
```

## 3. Deploy app

```bash
bash deploy/deploy.sh
```

The script will:

- create `.env.production` if missing;
- generate passwords/secrets;
- build and start Docker containers;
- configure Nginx;
- request HTTPS certificate;
- print admin credentials.

## Useful Commands

```bash
cd /opt/wedding-invite
docker compose ps
docker compose logs -f app
docker compose up -d --build
cat .admin-credentials.txt
```
