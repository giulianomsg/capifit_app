# 🏋️ CapiFit - Sistema Completo de Personal Trainer

Sistema profissional para gerenciamento de personal trainers e clientes, desenvolvido com React + Node.js + MySQL/PostgreSQL.

## 🚀 Instalação em Produção - VPS Ubuntu 24.04

### Pré-requisitos

```bash
# Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar MySQL
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql

# Configurar MySQL (definir senha root)
sudo mysql_secure_installation

# Instalar Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Instalar PM2 para gerenciar processos Node.js
sudo npm install -g pm2
```

### 1. Preparação do Projeto

```bash
# Navegar para o diretório web
cd /var/www

# Clonar o projeto
git clone https://github.com/seu-usuario/capifit.git capifit_app
cd capifit_app

# Definir permissões
sudo chown -R $USER:$USER /var/www/capifit_app
```

### 2. Configuração do Banco de Dados MySQL

```bash
# Acessar MySQL
sudo mysql -u root -p

# Executar os comandos SQL
CREATE DATABASE capifit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'capifit_user'@'localhost' IDENTIFIED BY 'SuaSenhaSegura123!';
GRANT ALL PRIVILEGES ON capifit_db.* TO 'capifit_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Importar estrutura do banco
cd /var/www/capifit_app
mysql -u capifit_user -p capifit_db < sql/mysql/02_create_tables.sql
mysql -u capifit_user -p capifit_db < sql/mysql/03_sample_data.sql
```

### 3. Configuração do Backend

```bash
# Navegar para pasta backend
cd /var/www/capifit_app/backend

# Instalar dependências
npm install

# Criar arquivo de ambiente
cp .env.example .env
```

**Editar `/var/www/capifit_app/backend/.env`:**
```bash
# Database Configuration
VITE_DB_TYPE=mysql
VITE_DB_HOST=localhost
VITE_DB_PORT=3306
VITE_DB_NAME=capifit_db
VITE_DB_USER=capifit_user
VITE_DB_PASSWORD=SuaSenhaSegura123!

# Server Configuration
PORT=3001
JWT_SECRET=sua_chave_jwt_muito_segura_aqui_123!
FRONTEND_URL=https://capifit.app.br

# API Configuration
VITE_API_URL=https://capifit.app.br/api
```

### 4. Configuração do Frontend

```bash
# Navegar para pasta principal
cd /var/www/capifit_app

# Instalar dependências
npm install

# Criar arquivo de ambiente
cp .env.example .env
```

**Editar `/var/www/capifit_app/.env`:**
```bash
VITE_API_URL=https://capifit.app.br/api
VITE_DB_TYPE=mysql
VITE_DB_HOST=localhost
VITE_DB_PORT=3306
VITE_DB_NAME=capifit_db
VITE_DB_USER=capifit_user
VITE_DB_PASSWORD=SuaSenhaSegura123!
```

### 5. Build do Frontend

```bash
cd /var/www/capifit_app
npm run build
```

### 6. Configuração do Nginx

**Criar `/etc/nginx/sites-available/capifit`:**

```nginx
server {
    listen 80;
    server_name capifit.app.br www.capifit.app.br;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name capifit.app.br www.capifit.app.br;
    
    # SSL Configuration (Configure após obter certificados SSL)
    # ssl_certificate /path/to/ssl/certificate.crt;
    # ssl_certificate_key /path/to/ssl/private.key;
    
    # Frontend - arquivos estáticos
    location / {
        root /var/www/capifit_app/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache para arquivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API - proxy para Node.js
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout       60s;
        proxy_send_timeout          60s;
        proxy_read_timeout          60s;
    }
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

**Ativar site e reiniciar Nginx:**

```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/capifit /etc/nginx/sites-enabled/

# Remover configuração padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 7. Configuração SSL com Certbot (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Criar link simbólico
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Obter certificado SSL
sudo certbot --nginx -d capifit.app.br -d www.capifit.app.br

# Configurar renovação automática
sudo systemctl status snap.certbot.renew.timer
```

### 8. Iniciar Aplicação com PM2

```bash
# Navegar para pasta backend
cd /var/www/capifit_app/backend

# Iniciar backend com PM2
pm2 start server.js --name "capifit-backend"

# Salvar configuração PM2
pm2 save

# Configurar PM2 para iniciar automaticamente
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Verificar status
pm2 status
```

### 9. Configuração do Firewall

```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 3306  # MySQL (se necessário acesso externo)
sudo ufw status
```

### 10. Monitoramento e Logs

```bash
# Logs do Backend
pm2 logs capifit-backend

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do MySQL
sudo tail -f /var/log/mysql/error.log

# Status dos serviços
sudo systemctl status nginx
sudo systemctl status mysql
pm2 status
```

### 11. Comandos Úteis para Manutenção

```bash
# Reiniciar backend
pm2 restart capifit-backend

# Atualizar código do repositório
cd /var/www/capifit_app
git pull origin main
npm run build
pm2 restart capifit-backend

# Backup do banco de dados
mysqldump -u capifit_user -p capifit_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
mysql -u capifit_user -p capifit_db < backup_arquivo.sql
```

## 🔐 Credenciais Padrão

**Administrador:**
- Email: `admin@capifit.com`
- Senha: `password`

## 📁 Estrutura do Projeto

```
capifit_app/
├── backend/                 # API Node.js + Express
│   ├── routes/             # Rotas da API
│   ├── server.js           # Servidor principal
│   └── package.json        # Dependências backend
├── src/                    # Frontend React
├── sql/                    # Scripts SQL
│   └── mysql/              # Scripts MySQL
├── dist/                   # Build de produção
└── package.json            # Dependências frontend
```

## 🌐 Acesso

Após a instalação, acesse:
- **Frontend:** https://capifit.app.br
- **API:** https://capifit.app.br/api
- **Health Check:** https://capifit.app.br/api/health

---

✅ **Sistema pronto para produção com MySQL, SSL, e monitoramento completo!**