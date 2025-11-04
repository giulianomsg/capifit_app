# 🦾 CapiFit – Guia passo a passo para implantação em produção

Este documento descreve o caminho suportado para colocar a plataforma CapiFit em produção usando **Express 5.1.0**, **React/Vite**, **PostgreSQL** e **Redis**, garantindo compatibilidade com o monorepo atual (workspaces `apps/api` e `apps/web`). O fluxo cobre tanto **Docker Compose** quanto **PM2**. Todos os passos assumem um servidor Ubuntu 22.04 limpo com acesso sudo.

---
## 1. Pré-requisitos obrigatórios

1. **Sistema operacional**: Ubuntu 22.04 LTS (ou superior) com acesso root/sudo.
2. **Domínio ou subdomínio** apontando para o servidor (ex.: `app.seudominio.com`).
3. **Ports liberadas**:
   - 80/443 para Nginx (HTTP/HTTPS)
   - 3001 (API) e 5173/4173 (dev/preview web) quando executar localmente.
4. **Dependências básicas**:
   ```bash
   sudo apt update && sudo apt install -y curl git build-essential ufw
   ```
5. **Firewall** (opcional, mas recomendado):
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

---
## 2. Instale ferramentas de runtime

### 2.1 Node.js 20 e npm 10
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # deve exibir v20.x
npm -v   # deve exibir 10.x
```

### 2.2 Docker + Docker Compose (opcional para stack containerizada)
```bash
curl -fsSL https://get.docker.com | sudo bash
sudo usermod -aG docker $USER
newgrp docker
sudo apt install -y docker-compose-plugin
```

### 2.3 PM2 (para execução sem containers)
```bash
sudo npm install -g pm2
```

---
## 3. Obter o código-fonte

```bash
cd /opt
sudo git clone https://github.com/giulianomsg/capifit_app.git
sudo chown -R $USER:$USER capifit_app
cd capifit_app

# Instale as dependências do monorepo **antes** de executar qualquer script
npm install
# Gere os tipos Prisma consumidos pela API
npm run generate --workspace apps/api
```

O repositório já vem organizado como monorepo npm com workspaces.

---
## 4. Preparar variáveis de ambiente

### 4.1 Configuração manual do `.env` da API
- Copie `apps/api/.env.example` para `apps/api/.env`.
- Preencha manualmente as variáveis essenciais (veja lista abaixo).
- Caso precise criar banco/usuário, use `apps/api/prisma/bootstrap.sql` como referência (executando os comandos manualmente no Postgres).

Para o frontend, copie e ajuste o template:
```bash
cp apps/web/.env.example apps/web/.env
```

### 4.1 Variáveis essenciais da API
Revise `apps/api/.env` gerado para confirmar:
- `PORT=3001`
- `API_BASE_URL=https://app.seudominio.com/api`
- `FRONTEND_URL=https://app.seudominio.com`
- `DATABASE_URL=postgresql://usuario:senha@host:5432/capifit`
- `SHADOW_DATABASE_URL` (para migrações Prisma)
- `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET` (mínimo 32 caracteres aleatórios)
- `REDIS_URL=redis://usuario:senha@host:6379`
- `SMTP_*` com as credenciais do provedor de e-mail (Mailgun, SES, etc.)
- `FILE_STORAGE_DRIVER=local` (ou `s3` com as chaves correspondentes)
- `ENABLE_EMAIL_NOTIFICATIONS=true`

### 4.2 Variáveis do frontend
Em `apps/web/.env` ajuste:
- `VITE_API_URL=https://app.seudominio.com/api`
- `VITE_WS_URL=https://app.seudominio.com`
- `VITE_WS_PATH=/socket.io`
- A API publica eventos Socket.IO `workout:created|updated|deleted|session-logged` e `nutrition:plan-created|plan-updated`; mantenha `VITE_WS_URL` acessível para que o frontend invalide caches automaticamente.
- Opcional: `VITE_GOOGLE_ANALYTICS_ID`, `VITE_SENTRY_DSN`
- Se precisar liberar hosts adicionais no modo preview (`npm run preview`), defina `VITE_PREVIEW_ALLOWED_HOSTS=dominio1,dominio2`.

Salve os arquivos `.env` em local seguro (backup + controle de acesso).

---
## 5. Implantação com Docker Compose

1. **Configure volumes e imagens** (o repositório já possui `docker-compose.yml`).
2. **Construa e suba os serviços**:
   ```bash
   docker compose pull
   docker compose build
   docker compose up -d
   ```
3. **Rodar migrações e seeds dentro do container**:
   ```bash
   docker compose exec api npm run migrate
   docker compose exec api npm run seed
   ```
4. **Verificar logs**:
   ```bash
   docker compose logs -f api
   docker compose logs -f web
   ```
5. **Atualizações futuras**:
   ```bash
   git pull origin main
   docker compose build --no-cache
   docker compose up -d
   docker compose exec api npm run migrate
   docker compose exec api npm run seed
   ```

### 5.1 Nginx com Docker
O serviço `web` já entrega a aplicação através de um Nginx interno, expondo a porta 8080. Faça o proxy reverso no host (fora dos containers) ou configure DNS direto para essa porta com TLS provido externamente (Traefik/Caddy).

---
## 6. Implantação usando PM2 (sem Docker)

1. **Instale dependências** (fora de containers):
   ```bash
   npm install
   ```
2. **Gere Prisma client, migre e aplique seeds**:
   ```bash
   npm run generate --workspace apps/api
   npm run migrate --workspace apps/api
   npm run seed --workspace apps/api
   ```
3. **Construa API e Web**:
   ```bash
   npm run build
   ```
4. **Inicie com PM2**:
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 status
   ```
5. **Configurar startup automático**:
   ```bash
   pm2 save
   pm2 startup systemd
   ```

---
## 7. Configurando o Nginx para `capifit.app.br`

> ✅ Requisitos: DNS dos domínios `capifit.app.br` e `www.capifit.app.br` apontando para o IP público do servidor, portas 80 e 443 liberadas e o build recente da aplicação (`npm run build`).

### 7.1 Instalar Nginx e Certbot

```bash
sudo apt update
sudo apt install -y nginx python3-certbot-nginx
```

Após a instalação, o Nginx já cria um serviço systemd ativo (`sudo systemctl status nginx`).

### 7.2 Criar o servidor virtual

Crie o arquivo `/etc/nginx/sites-available/capifit_app` com o conteúdo abaixo, ajustando caminhos se você implantou o projeto em outra pasta. O bloco trata HTTP → HTTPS, entrega o frontend buildado e atua como proxy reverso para a API.

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name capifit.app.br www.capifit.app.br;

  # redireciona tudo em HTTP para HTTPS
  return 301 https://capifit.app.br$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name capifit.app.br www.capifit.app.br;

  # certificados serão preenchidos pelo Certbot na etapa seguinte
  ssl_certificate     /etc/letsencrypt/live/capifit.app.br/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/capifit.app.br/privkey.pem;
  include /etc/letsencrypt/options-ssl-nginx.conf;
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

  # Frontend estático
  root /var/www/capifit_app/apps/web/build;
  index index.html;

  # Garante roteamento SPA
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Proxy da API para o processo PM2 (porta 3001)
  location /api/ {
    proxy_pass http://127.0.0.1:3001/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Proxy do Socket.IO exposto pela API
  location /socket.io/ {
    proxy_pass http://127.0.0.1:3001/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Habilite o site e teste a sintaxe:

```bash
sudo ln -s /etc/nginx/sites-available/capifit_app /etc/nginx/sites-enabled/capifit_app
sudo nginx -t
sudo systemctl reload nginx
```

### 7.3 Emitir certificados TLS com Let's Encrypt

```bash
sudo certbot --nginx -d capifit.app.br -d www.capifit.app.br
```

O Certbot ajustará o bloco HTTPS e instalará timers para renovação automática (`systemctl list-timers | grep certbot`). Valide o acesso em `https://capifit.app.br` e `https://www.capifit.app.br`.

### 7.4 Ajustes de headers opcionais

Para reforço adicional, considere habilitar headers de segurança e caching básico para ativos estáticos no bloco HTTPS:

```nginx
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
    expires 30d;
    access_log off;
  }
```

---
## 8. Banco de dados e Redis gerenciados manualmente

### 8.1 PostgreSQL local
```bash
sudo apt install -y postgresql postgresql-contrib
npm run db:bootstrap --workspace apps/api
```
O script `db:bootstrap` solicitará host/porta/senhas e criará os bancos `capifit_db` e `capifit_shadow`, mantendo o `.env` fora do Git.

Prefere executar manualmente via `psql`? Utilize o arquivo SQL de referência:
```bash
sudo -u postgres psql -f apps/api/prisma/bootstrap.sql
```
Ajuste `postgresql.conf` e `pg_hba.conf` para garantir autenticação segura (ex.: `scram-sha-256`) e acesso remoto conforme a política da sua infraestrutura.

### 8.2 Redis
```bash
sudo apt install -y redis-server
sudo sed -i "s/^supervised no/supervised systemd/" /etc/redis/redis.conf
sudo systemctl enable --now redis-server
```

Atualize `REDIS_URL=redis://127.0.0.1:6379` nos `.env` se usar o serviço local.

---
## 9. Manutenção contínua

1. **Logs**:
   ```bash
   pm2 logs capifit-api
   pm2 logs capifit-web
   ```

2. **Atualizações**:
   ```bash
   git pull origin main
   npm install
   npm run build
   pm2 reload ecosystem.config.cjs
   ```

3. **Renovação de certificados**: o Certbot cria um timer systemd (`certbot.timer`). Verifique os logs esporadicamente:
   ```bash
   sudo journalctl -u certbot --since "7 days ago"
   ```

> A API depende de PostgreSQL e Redis externos. Configure serviços gerenciados (RDS, Elasticache) ou instale-os no mesmo host.

---
## 10. Checklist pós-implantação

1. Acesse `https://app.seudominio.com/health` e confirme `{ "status": "ok" }`.
2. Faça login com o usuário administrador seed `admin@capifit.com` (senha definida em `ADMIN_DEFAULT_PASSWORD`).
3. Crie/edite usuários, vincule clientes a treinadores, confirme upload de avatares.
4. Cadastre um plano de treino, avalie se notificações em tempo real estão chegando (Socket.IO).
5. Valide envio de e-mails transacionais (verifique logs do worker BullMQ).
6. Monitore logs: `docker compose logs` ou `pm2 logs`.

---
## 11. Atualizações seguras

1. Faça backup do banco (`pg_dump`) e dos uploads (`apps/api/storage` ou volume `api_storage`).
2. Aplique `git pull` + `npm install` (ou `docker compose pull`).
3. Rode `npm run migrate` (ou `docker compose exec api npm run migrate`).
4. Reinicie serviços (`pm2 restart all` ou `docker compose up -d`).
5. Valide `/health`, notificações e fila de e-mails.

---
## 12. Segurança e observabilidade

- **Autenticação JWT**: tokens de acesso (15 min) + refresh (14 dias) com revogação server-side.
- **Logs estruturados**: Pino registra JSON no stdout (PM2/Docker capturam automaticamente).
- **Rate limiting**: configurável via `.env` (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`) e implementado com `rate-limiter-flexible@8.1.0`.
- **Backups**: configure rotinas diárias de `pg_dump` e snapshots dos uploads.
- **Monitoramento**: exponha métricas via ferramentas externas (Prometheus, Grafana). As tabelas `audit_logs` e `notification_jobs` ajudam na auditoria das ações sensíveis.

Seguindo este roteiro, a plataforma roda com Express 5.1.0, `rate-limiter-flexible@8.1.0` e linting baseado em ESLint 8, sem dependências incompatíveis (\`express-async-errors\` permanece bloqueado via \`overrides\`).
