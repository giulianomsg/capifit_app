# CapiFit - Sistema Completo de Personal Training

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.x-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-teal.svg)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Sistema completo e profissional para personal trainers gerenciarem seus clientes, treinos, avaliações físicas e planos nutricionais.

## 🚀 Funcionalidades Principais

### 💪 Para Personal Trainers
- **Dashboard Executivo** - Métricas completas, agenda e performance
- **Gerenciamento de Clientes** - Cadastro completo com histórico detalhado
- **Sistema de Avaliação Física** - Medidas corporais, fotos evolutivas e relatórios
- **Criação de Treinos** - Biblioteca de exercícios e templates personalizados
- **Planos Nutricionais** - Base de alimentos e calculadora nutricional
- **Hub de Comunicação** - Chat integrado com templates rápidos
- **Centro de Notificações** - Sistema completo de alertas e lembretes

### 🏃 Para Clientes
- **Perfil Completo** - Dados pessoais, objetivos e preferências
- **Acompanhamento de Treinos** - Registro de séries, repetições e progressão
- **Histórico Nutricional** - Acompanhamento de dietas e evolução
- **Comunicação Direta** - Chat com seu personal trainer
- **Relatórios de Progresso** - Gráficos e métricas de evolução

## 🛠️ Instalação Completa no Servidor VPS

### Pré-requisitos
- **VPS Ubuntu 20.04+** ou CentOS 7+
- **Acesso root** ou usuário com sudo
- **Domínio configurado** (capifit.app.br)

---

## 📋 Passo 1: Preparação do Servidor

### 1.1 Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget git unzip -y
```

### 1.2 Instalar Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version  # deve mostrar v18.x.x
npm --version   # deve mostrar 9.x.x
```

### 1.3 Instalar PM2 (Gerenciador de Processos)
```bash
sudo npm install -g pm2
```

### 1.4 Instalar e Configurar Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
sudo ufw allow 'Nginx Full'
```

---

## 🗄️ Passo 2: Configurar MySQL

### 2.1 Instalar MySQL Server
```bash
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2.2 Configuração Inicial de Segurança
```bash
sudo mysql_secure_installation
```

**Responda as perguntas:**
- Validate Password Plugin: **Y**
- Password Level: **2** (Strong)
- Nova senha root: **Crie uma senha forte**
- Remove anonymous users: **Y**
- Disallow root login remotely: **Y**
- Remove test database: **Y**
- Reload privilege tables: **Y**

### 2.3 Criar Banco e Usuário
```bash
sudo mysql -u root -p
```

**Execute no console MySQL:**
```sql
CREATE DATABASE capifit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'capifit_user'@'localhost' IDENTIFIED BY 'SuaSenhaForteAqui123!';
GRANT ALL PRIVILEGES ON capifit_db.* TO 'capifit_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 📥 Passo 3: Deploy da Aplicação

### 3.1 Clonar o Repositório
```bash
cd /var/www/
sudo git clone https://github.com/seu-usuario/capifit.git capifit_app
sudo chown -R $USER:$USER /var/www/capifit_app
cd /var/www/capifit_app
```

### 3.2 Instalar Dependências
```bash
npm install
```

### 3.3 Configurar Variáveis de Ambiente
```bash
cp .env.example .env
nano .env
```

**Configure o arquivo .env:**
```env
# Configuração do MySQL
VITE_DB_TYPE=mysql
VITE_DB_HOST=localhost
VITE_DB_PORT=3306
VITE_DB_NAME=capifit_db
VITE_DB_USER=capifit_user
VITE_DB_PASSWORD=SuaSenhaForteAqui123!
VITE_API_URL=https://capifit.app.br/api

# JWT Secret (gere uma chave única e segura)
VITE_JWT_SECRET=gere-uma-chave-jwt-super-secreta-aqui-com-64-caracteres

# Configurações do domínio
VITE_APP_URL=https://capifit.app.br
VITE_APP_NAME=CapiFit
```

### 3.4 Importar Schema do Banco
```bash
mysql -u capifit_user -p capifit_db < sql/mysql/01_create_database.sql
mysql -u capifit_user -p capifit_db < sql/mysql/02_create_tables.sql
mysql -u capifit_user -p capifit_db < sql/mysql/03_sample_data.sql
```

### 3.5 Build da Aplicação
```bash
npm run build
```

---

## 🌐 Passo 4: Configurar Nginx para capifit.app.br

### 4.1 Criar Configuração do Site
```bash
sudo nano /etc/nginx/sites-available/capifit
```

**Adicione a seguinte configuração:**
```nginx
server {
    listen 80;
    server_name capifit.app.br www.capifit.app.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name capifit.app.br www.capifit.app.br;

    # SSL Certificate (será configurado com Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/capifit.app.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/capifit.app.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Diretório dos arquivos estáticos
    root /var/www/capifit_app/dist;
    index index.html;

    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend - Aplicação React
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend - Proxy para Node.js
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Bloquear acesso a arquivos sensíveis
    location ~ /\.(ht|env|git) {
        deny all;
    }

    # Logs específicos do site
    access_log /var/log/nginx/capifit_access.log;
    error_log /var/log/nginx/capifit_error.log;
}
```

### 4.2 Ativar o Site
```bash
sudo ln -s /etc/nginx/sites-available/capifit /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
```

---

## 🔒 Passo 5: Configurar SSL com Let's Encrypt

### 5.1 Instalar Certbot
```bash
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 5.2 Obter Certificado SSL
```bash
# Primeiro, edite temporariamente o Nginx sem SSL
sudo nano /etc/nginx/sites-available/capifit
```

**Configure temporariamente sem SSL:**
```nginx
server {
    listen 80;
    server_name capifit.app.br www.capifit.app.br;
    
    root /var/www/capifit_app/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo systemctl reload nginx

# Obter certificado
sudo certbot --nginx -d capifit.app.br -d www.capifit.app.br

# Restaurar configuração completa com SSL
sudo nano /etc/nginx/sites-available/capifit
```

**Restaure a configuração SSL completa mostrada no Passo 4.1**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5.3 Configurar Renovação Automática
```bash
sudo crontab -e

# Adicione esta linha para renovação automática
0 3 * * * /usr/bin/certbot renew --quiet
```

---

## 🚀 Passo 6: Configurar Backend API

### 6.1 Criar Estrutura do Backend
```bash
mkdir -p /var/www/capifit_app/backend
cd /var/www/capifit_app/backend
```

### 6.2 Criar package.json
```bash
cat > package.json << 'EOF'
{
  "name": "capifit-backend",
  "version": "1.0.0",
  "description": "CapiFit Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "rate-limit": "^1.0.2",
    "dotenv": "^16.3.1"
  }
}
EOF
```

### 6.3 Instalar Dependências do Backend
```bash
npm install
```

### 6.4 Criar Arquivo do Servidor
```bash
cat > server.js << 'EOF'
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});
app.use(limiter);

// Configuração do MySQL
const dbConfig = {
  host: process.env.VITE_DB_HOST || 'localhost',
  user: process.env.VITE_DB_USER || 'capifit_user',
  password: process.env.VITE_DB_PASSWORD,
  database: process.env.VITE_DB_NAME || 'capifit_db',
  charset: 'utf8mb4'
};

// Rotas principais
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CapiFit API está funcionando!' });
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.VITE_JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Rota de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    await connection.end();
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.VITE_JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`CapiFit API rodando na porta ${PORT}`);
});
EOF
```

### 6.5 Criar arquivo .env para o backend
```bash
cp /var/www/capifit_app/.env /var/www/capifit_app/backend/.env
```

### 6.6 Iniciar Backend com PM2
```bash
pm2 start server.js --name capifit-api
pm2 startup
pm2 save
```

---

## 🔧 Passo 7: Configurações Finais

### 7.1 Configurar Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 3306/tcp  # MySQL
sudo ufw --force enable
```

### 7.2 Configurar Backup Automático
```bash
sudo mkdir -p /var/backups/capifit
sudo chown $USER:$USER /var/backups/capifit

cat > /home/backup-capifit.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/capifit"

# Backup do banco de dados
mysqldump -u capifit_user -p'SuaSenhaForteAqui123!' capifit_db > "$BACKUP_DIR/capifit_db_$DATE.sql"

# Backup dos arquivos da aplicação
tar -czf "$BACKUP_DIR/capifit_files_$DATE.tar.gz" -C /var/www/ capifit_app/

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /home/backup-capifit.sh

# Configurar backup automático diário
sudo crontab -e
# Adicione: 0 2 * * * /home/backup-capifit.sh
```

### 7.3 Verificar Status dos Serviços
```bash
# Verificar Nginx
sudo systemctl status nginx

# Verificar MySQL
sudo systemctl status mysql

# Verificar Backend API
pm2 status

# Testar conectividade
curl -I https://capifit.app.br
curl https://capifit.app.br/api/health
```

---

## 📊 Monitoramento e Manutenção

### Logs do Sistema
```bash
# Logs do Nginx
sudo tail -f /var/log/nginx/capifit_access.log
sudo tail -f /var/log/nginx/capifit_error.log

# Logs do Backend
pm2 logs capifit-api

# Logs do MySQL
sudo tail -f /var/log/mysql/error.log
```

### Comandos de Manutenção
```bash
# Restart completo
sudo systemctl restart nginx
sudo systemctl restart mysql
pm2 restart capifit-api

# Atualizar aplicação
cd /var/www/capifit_app
git pull origin main
npm install
npm run build
pm2 restart capifit-api

# Verificar performance
pm2 monit
```

### Troubleshooting Comum

**1. Site não carrega:**
```bash
sudo nginx -t
sudo systemctl status nginx
curl -I https://capifit.app.br
```

**2. API não responde:**
```bash
pm2 status
pm2 logs capifit-api
curl https://capifit.app.br/api/health
```

**3. Erro de banco de dados:**
```bash
sudo systemctl status mysql
mysql -u capifit_user -p -e "SHOW DATABASES;"
```

---

## ✅ Verificação Final

Após completar todos os passos, teste:

1. **Acesse https://capifit.app.br** - Deve carregar o frontend
2. **Teste a API:** `curl https://capifit.app.br/api/health`
3. **Faça login** no sistema
4. **Verifique funcionalidades** básicas

---

## 📞 Suporte

Para dúvidas ou problemas:
- 🐛 **Issues:** [GitHub Issues](https://github.com/seu-usuario/capifit/issues)
- 📧 **Email:** suporte@capifit.app.br
- 📱 **WhatsApp:** (11) 99999-9999

---

**CapiFit** - Sistema Profissional de Personal Training
Desenvolvido com ❤️ usando React, Node.js e MySQL