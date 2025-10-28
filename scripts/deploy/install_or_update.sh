#!/usr/bin/env bash
set -euo pipefail

# scripts/deploy/install_or_update.sh
# Uso:
# sudo DOMAIN=capifit.app.br BACKEND_PORT=3001 BUILD_DIR=/var/www/capifit_app/build PHP_FPM_SOCKET=/run/php/php8.3-fpm.sock ./scripts/deploy/install_or_update.sh

DOMAIN="${DOMAIN:-capifit.app.br}"
BACKEND_PORT="${BACKEND_PORT:-3001}"
BUILD_DIR="${BUILD_DIR:-/var/www/capifit_app/build}"
PHP_FPM_SOCKET="${PHP_FPM_SOCKET:-/run/php/php8.3-fpm.sock}"
SITE_AVAIL="/etc/nginx/sites-available/${DOMAIN}.conf"
SITE_ENABL="/etc/nginx/sites-enabled/${DOMAIN}.conf"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@${DOMAIN}}"
REQUEST_CERT="${REQUEST_CERT:-false}"

echo "==> Projeto: ${PROJECT_DIR}"
echo "==> Dominio: ${DOMAIN}"
echo "==> Backend: 127.0.0.1:${BACKEND_PORT}"
echo "==> BuildDir: ${BUILD_DIR}"
echo "==> PHP-FPM: ${PHP_FPM_SOCKET}"
echo

# 1) Dependências básicas
echo "==> Atualizando pacotes"
apt-get update -y
echo "==> Instalando Nginx, Certbot e PHP"
apt-get install -y nginx certbot python3-certbot-nginx php-fpm php-mysql

echo "==> Garantindo que Nginx está habilitado"
systemctl enable --now nginx

# 2) Build do frontend (Vite)
cd "${PROJECT_DIR}"
if [ -f package-lock.json ]; then
  echo "==> npm ci"
  npm ci
else
  echo "==> npm install"
  npm install
fi

echo "==> Vite build (gera ${BUILD_DIR})"
rm -rf "${BUILD_DIR}" "${PROJECT_DIR}/dist"
npm run build

# Detectar se o Vite gerou 'build' ou 'dist'
if [ ! -f "${BUILD_DIR}/index.html" ]; then
  if [ -f "${PROJECT_DIR}/dist/index.html" ]; then
    echo "==> Detectado 'dist'. Ajustando BUILD_DIR para dist."
    BUILD_DIR="${PROJECT_DIR}/dist"
  fi
fi

if [ ! -f "${BUILD_DIR}/index.html" ]; then
  echo "ERRO: index.html não encontrado em ${BUILD_DIR} nem em dist/"
  exit 1
fi

# 3) Gerar conf do Nginx a partir do template no repo
TEMPLATE="${PROJECT_DIR}/config/nginx/capifit.app.br.conf"
if [ ! -f "${TEMPLATE}" ]; then
  echo "ERRO: Template Nginx não encontrado em ${TEMPLATE}"
  exit 1
fi

echo "==> Gerando ${SITE_AVAIL}"
sed \
  -e "s|{{DOMAIN}}|${DOMAIN}|g" \
  -e "s|{{BUILD_DIR}}|${BUILD_DIR}|g" \
  -e "s|{{BACKEND_PORT}}|${BACKEND_PORT}|g" \
  -e "s|{{PHP_FPM_SOCKET}}|${PHP_FPM_SOCKET}|g" \
  "${TEMPLATE}" > "${SITE_AVAIL}"

ln -sf "${SITE_AVAIL}" "${SITE_ENABL}"

mkdir -p "/var/log/nginx"

echo "==> Validando configuração do Nginx"
nginx -t

echo "==> Recarregando Nginx"
systemctl reload nginx

if [ "${REQUEST_CERT}" = "true" ]; then
  echo "==> Solicitando/renovando certificado com Certbot"
  certbot --nginx --non-interactive --agree-tos --email "${CERTBOT_EMAIL}" -d "${DOMAIN}" -d "www.${DOMAIN}" || true
fi

# 4) Backend com PM2
if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Instalando PM2 global"
  npm install -g pm2
fi

cd "${PROJECT_DIR}"
BACKEND_START="backend/server.js"
if [ ! -f "${BACKEND_START}" ]; then
  echo "ERRO: backend/server.js não encontrado"
  exit 1
fi

echo "==> Atualizando processo PM2"
if pm2 describe capifit-backend >/dev/null 2>&1; then
  pm2 reload capifit-backend --update-env --cwd "${PROJECT_DIR}"
else
  pm2 start "${BACKEND_START}" --name capifit-backend --cwd "${PROJECT_DIR}" --update-env
fi

pm2 save

if command -v systemctl >/dev/null 2>&1; then
  pm2 startup systemd -u root --hp /root >/dev/null || true
fi

echo "==> Deploy concluído"
