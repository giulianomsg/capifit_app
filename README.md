# 🏋️ CapiFit – Guia Completo de Implantação em Produção

Sistema completo para personal trainers com frontend em **React + Vite** e backend em **Node.js + Express**. Este guia revisado documenta todo o processo para subir o projeto em um servidor **Ubuntu 24.04.3 LTS** com **MySQL**, **Nginx**, **PM2** e **Certbot**, garantindo 100% de sucesso no deploy.

## 🧱 Arquitetura do Projeto
- **Frontend:** React 18, Vite, Tailwind CSS – arquivos compilados ficam em `dist/`.
- **Backend:** Express 5 (em `backend/server.js`) servindo a API REST.
- **Banco de dados:** Scripts SQL prontos em `sql/mysql/` (MySQL 8.x/MariaDB 10.6+).
- **Process Manager:** PM2 para manter o backend sempre ativo.
- **Servidor web:** Nginx como proxy reverso para API + servidor de arquivos estáticos.

## 🚀 Fluxo Geral de Deploy (Visão Rápida)
1. Preparar o servidor (usuário, atualizações, firewall).
2. Instalar Node.js 20 LTS, Git, MySQL, Nginx, PM2 e Certbot.
3. Clonar o repositório em `/var/www/capifit_app`.
4. Configurar o banco de dados com os scripts SQL.
5. Preencher os arquivos `.env` do frontend e backend.
6. Instalar dependências (`npm install`) e gerar o build (`npm run build`).
7. Iniciar a API com PM2 e configurar inicialização automática.
8. Publicar o frontend com Nginx e habilitar HTTPS via Certbot.
9. Validar endpoints, logs e agendar backups.

Cada etapa detalhada está documentada abaixo.

---

## ✅ 0. Preparação Inicial
```bash
# Conectar ao servidor (exemplo)
ssh root@SEU_IP

# (Opcional) criar usuário de deploy e dar permissões sudo
adduser deploy
usermod -aG sudo deploy
su - deploy
```

**Sincronize o relógio e defina o timezone:**
```bash
sudo timedatectl set-timezone America/Sao_Paulo
sudo apt update && sudo apt install -y chrony
sudo systemctl enable --now chronyd
```

---

## ✅ 1. Atualizar o Sistema e Instalar Pacotes Essenciais
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl wget git ufw unzip
```

---

## ✅ 2. Instalar Node.js 20 LTS e PM2
```bash
# Repositório oficial NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifique as versões
node -v
npm -v

# PM2 global
sudo npm install -g pm2
```

---

## ✅ 3. Instalar e Proteger o MySQL 8
```bash
sudo apt install -y mysql-server
sudo systemctl enable --now mysql

# Ajustes de segurança (defina a senha do usuário root)
sudo mysql_secure_installation
```

---

## ✅ 4. Configurar Firewall UFW
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## ✅ 5. Clonar o Repositório e Ajustar Permissões
```bash
cd /var/www
sudo git clone https://github.com/SEU_USUARIO/capifit_app.git
sudo chown -R $USER:$USER capifit_app
cd capifit_app
```
> Substitua `SEU_USUARIO` pelo proprietário do repositório. Execute `git remote -v` para confirmar a URL.

---

## ✅ 6. Preparar Variáveis de Ambiente

### Frontend (`.env`)
```bash
cp .env.example .env
nano .env
```
Valores mínimos recomendados:
```
VITE_API_URL=https://capifit.app.br/api
VITE_DB_TYPE=mysql
VITE_DB_HOST=localhost
VITE_DB_PORT=3306
VITE_DB_NAME=capifit_db
VITE_DB_USER=capifit_user
VITE_DB_PASSWORD=DefinaUmaSenhaForteAqui
```
Integrações como Supabase, OpenAI, Stripe etc. podem ser preenchidas posteriormente.

### Backend (`backend/.env`)
```bash
cp backend/.env.example backend/.env
nano backend/.env
```
Configure conforme o ambiente de produção:
```
PORT=3001
FRONTEND_URL=https://capifit.app.br
FRONTEND_URLS=https://capifit.app.br,http://localhost:5173
JWT_SECRET=altere_esta_chave_super_segura
SKIP_DB_CONNECTION=false
VITE_DB_TYPE=mysql
VITE_DB_HOST=localhost
VITE_DB_PORT=3306
VITE_DB_NAME=capifit_db
VITE_DB_USER=capifit_user
VITE_DB_PASSWORD=DefinaUmaSenhaForteAqui
```

> **Dica:** se o banco ainda não estiver disponível, defina `SKIP_DB_CONNECTION=true` temporariamente para o backend subir com dados mock enquanto testa o deploy.

---

## ✅ 7. Instalar Dependências e Gerar o Build do Frontend
```bash
cd /var/www/capifit_app
npm install --production
npm run build
```
O build gerará a pasta `dist/` com os arquivos estáticos prontos para o Nginx.

---

## ✅ 8. Criar Banco e Importar Estrutura/Dados
```bash
# Entrar no MySQL como root
mysql -u root -p
```
Dentro do prompt MySQL execute:
```sql
CREATE DATABASE capifit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'capifit_user'@'localhost' IDENTIFIED BY 'DefinaUmaSenhaForteAqui';
GRANT ALL PRIVILEGES ON capifit_db.* TO 'capifit_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
Depois importe os scripts na ordem indicada:
```bash
cd /var/www/capifit_app
mysql -u capifit_user -p capifit_db < sql/mysql/01_create_database.sql
mysql -u capifit_user -p capifit_db < sql/mysql/02_create_tables.sql
mysql -u capifit_user -p capifit_db < sql/mysql/03_sample_data.sql
```

---

## ✅ 9. Iniciar o Backend com PM2
```bash
cd /var/www/capifit_app
pm2 start backend/server.js --name capifit-backend --cwd /var/www/capifit_app/backend --update-env
pm2 save
pm2 startup systemd -u $USER --hp $HOME
```

Verifique se está tudo ativo:
```bash
pm2 status
pm2 logs capifit-backend
```

Teste o endpoint de saúde:
```bash
curl http://localhost:3001/api/health
```

---

## ✅ 10. Configurar o Nginx como Proxy Reverso
Crie `/etc/nginx/sites-available/capifit` com o conteúdo abaixo:
```nginx
server {
    listen 80;
    server_name capifit.app.br www.capifit.app.br;

    location /.well-known/acme-challenge/ {
        root /var/www/capifit_app/dist;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name capifit.app.br www.capifit.app.br;

    ssl_certificate /etc/letsencrypt/live/capifit.app.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/capifit.app.br/privkey.pem;

    root /var/www/capifit_app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header X-XSS-Protection "1; mode=block" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
```

Ative o site e reinicie:
```bash
sudo ln -s /etc/nginx/sites-available/capifit /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

> Se ainda não tiver certificado SSL, configure primeiro apenas o bloco `listen 80` e execute o Certbot (próxima etapa). Depois habilite o bloco HTTPS.

---

## ✅ 11. Emitir Certificado SSL com Certbot
```bash
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d capifit.app.br -d www.capifit.app.br
sudo systemctl status snap.certbot.renew.timer
```
Certifique-se de que o cron de renovação automática está ativo.

---

## ✅ 12. Verificações Finais
```bash
# Verificar aplicação
curl -I https://capifit.app.br
curl https://capifit.app.br/api/health

# Verificar serviços
sudo systemctl status nginx
sudo systemctl status mysql
pm2 status
```
Abra o domínio no navegador e faça login com as credenciais padrão abaixo.

---

## 🛠️ Manutenção e Atualizações
```bash
# Atualizar código e reiniciar backend
cd /var/www/capifit_app
git pull origin main
npm install --production
npm run build
pm2 restart capifit-backend

# Logs e monitoramento
pm2 logs capifit-backend
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/mysql/error.log

# Backup do banco
mysqldump -u capifit_user -p capifit_db > ~/capifit_backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 👤 Credenciais Padrão de Acesso (Mock)
- **Administrador:** `admin@capifit.com`
- **Senha:** `password`

> Altere ou crie usuários reais assim que a base de dados estiver configurada.

---

## 🧯 Solução de Problemas Comuns
- **`PathError [TypeError]: Missing parameter name at index`** – Já corrigido no código; garanta que você tenha rodado `git pull` antes do deploy.
- **API não conecta no banco:** verifique o arquivo `backend/.env` (host, usuário, senha). Se precisar subir sem banco, defina `SKIP_DB_CONNECTION=true` e reinicie o PM2.
- **CORS bloqueando requisições:** confirme se `FRONTEND_URL` e `FRONTEND_URLS` incluem o domínio atual.
- **Build antigo no navegador:** limpe cache (`Ctrl+F5`) ou incremente `Cache-Control` no Nginx.

---

## 📚 Próximos Passos
- Implementar banco remoto/SaaS (ex.: Supabase) seguindo o roteiro avançado em [`setup-capifit-production.md`](setup-capifit-production.md).
- Configurar pipelines CI/CD, monitoramento com PM2 Plus ou Uptime Kuma e rotinas automáticas de backup.
- Revisar regras de firewall/segurança periódicamente.

Com este passo a passo você terá o CapiFit 100% funcional em produção.
