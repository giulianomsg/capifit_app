# 🚀 CapiFit Backend API Setup Guide

## 📋 Visão Geral

Este guia mostra como criar o backend API necessário para funcionar com o banco de dados MySQL/PostgreSQL local.

## 🛠️ Opções de Implementação

### Opção 1: Node.js + Express (Recomendado)

#### 1. Estrutura do Projeto
```
capifit-backend/
├── package.json
├── server.js
├── config/
│   └── database.js
├── models/
│   ├── User.js
│   ├── Client.js
│   └── ... (outros modelos)
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── clients.js
│   └── ... (outras rotas)
├── middleware/
│   ├── auth.js
│   └── validation.js
└── utils/
    └── helpers.js
```

#### 2. Dependências Necessárias
```bash
npm init -y
npm install express cors helmet morgan bcryptjs jsonwebtoken
npm install mysql2 # Para MySQL
# OU
npm install pg # Para PostgreSQL
npm install sequelize # ORM recomendado
npm install dotenv
```

#### 3. Configuração Base (server.js)
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clientRoutes = require('./routes/clients');
// ... outras rotas

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
// ... outras rotas

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Opção 2: PHP + Laravel

#### 1. Instalação
```bash
composer create-project laravel/laravel capifit-api
cd capifit-api
```

#### 2. Configuração do Banco (.env)
```env
DB_CONNECTION=mysql  # ou pgsql para PostgreSQL
DB_HOST=127.0.0.1
DB_PORT=3306        # ou 5432 para PostgreSQL
DB_DATABASE=capifit_db
DB_USERNAME=capifit_user
DB_PASSWORD=capifit_password
```

#### 3. Criar Models e Migrations
```bash
php artisan make:model User -m
php artisan make:model Client -m
php artisan make:model Exercise -m
# ... outros models
```

### Opção 3: Python + FastAPI

#### 1. Instalação
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary # PostgreSQL
# OU
pip install fastapi uvicorn sqlalchemy PyMySQL # MySQL
pip install python-jose[cryptography] passlib[bcrypt]
```

#### 2. Estrutura Base
```python
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Database setup
DATABASE_URL = "postgresql://user:password@localhost/capifit_db"
# OU para MySQL:
# DATABASE_URL = "mysql+pymysql://user:password@localhost/capifit_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI(title="CapiFit API")

# Models, routes, etc...
```

## 🔧 Configuração do Banco de Dados

### Para PostgreSQL:

#### 1. Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2. Configurar Usuário e Banco
```bash
sudo -u postgres psql

-- Criar usuário
CREATE USER capifit_user WITH ENCRYPTED PASSWORD 'capifit_password';

-- Criar banco
CREATE DATABASE capifit_db OWNER capifit_user;

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE capifit_db TO capifit_user;

-- Sair
\q
```

#### 3. Executar Schema
```bash
psql -U capifit_user -d capifit_db -f sql/postgresql/01_create_database.sql
psql -U capifit_user -d capifit_db -f sql/postgresql/02_create_tables.sql
psql -U capifit_user -d capifit_db -f sql/postgresql/03_sample_data.sql
```

### Para MySQL/MariaDB:

#### 1. Instalar MySQL/MariaDB
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server
# OU para MariaDB
sudo apt install mariadb-server

# Configuração inicial
sudo mysql_secure_installation
```

#### 2. Configurar Usuário e Banco
```sql
sudo mysql -u root -p

-- Criar usuário
CREATE USER 'capifit_user'@'localhost' IDENTIFIED BY 'capifit_password';

-- Criar banco
CREATE DATABASE capifit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Conceder privilégios
GRANT ALL PRIVILEGES ON capifit_db.* TO 'capifit_user'@'localhost';
FLUSH PRIVILEGES;

-- Sair
EXIT;
```

#### 3. Executar Schema
```bash
mysql -u capifit_user -p capifit_db < sql/mysql/01_create_database.sql
mysql -u capifit_user -p capifit_db < sql/mysql/02_create_tables.sql
mysql -u capifit_user -p capifit_db < sql/mysql/03_sample_data.sql
```

## 🔐 Implementação da Autenticação

### Exemplo com Node.js/Express (routes/auth.js)
```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();

// Register
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      email,
      password_hash,
      full_name,
      role: role || 'client'
    });
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

## 📊 Exemplo de API Endpoints

### Endpoints Principais
```
POST   /api/auth/signup          - Registrar usuário
POST   /api/auth/signin          - Login
POST   /api/auth/signout         - Logout
GET    /api/auth/me              - Dados do usuário atual

GET    /api/users                - Listar usuários
PUT    /api/users/:id            - Atualizar usuário

GET    /api/clients              - Listar clientes
POST   /api/clients              - Criar cliente
PUT    /api/clients/:id          - Atualizar cliente
DELETE /api/clients/:id          - Deletar cliente

GET    /api/exercises            - Listar exercícios
POST   /api/exercises            - Criar exercício

GET    /api/workouts             - Listar treinos
POST   /api/workouts             - Criar treino

GET    /api/notifications        - Listar notificações
POST   /api/notifications        - Criar notificação

POST   /api/files/upload         - Upload de arquivos
```

## 🚀 Deployment

### 1. Configurar PM2 (Node.js)
```bash
npm install -g pm2
pm2 start server.js --name capifit-api
pm2 startup
pm2 save
```

### 2. Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/capifit-api
server {
    listen 80;
    server_name api.capifit.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Variáveis de Ambiente Backend
```env
# Backend .env
NODE_ENV=production
PORT=3001
JWT_SECRET=seu-jwt-secret-super-seguro
DB_HOST=localhost
DB_PORT=5432
DB_NAME=capifit_db
DB_USER=capifit_user
DB_PASSWORD=capifit_password
```

## ✅ Teste da API

### 1. Teste com curl
```bash
# Registrar usuário
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","full_name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### 2. Teste com Postman
Importe a collection de API endpoints e teste todas as funcionalidades.

## 🔧 Próximos Passos

1. **Escolher uma opção** de backend (Node.js recomendado)
2. **Configurar o banco** (PostgreSQL recomendado)
3. **Implementar a API** seguindo os exemplos
4. **Testar todas as rotas** 
5. **Fazer deploy** no seu VPS
6. **Atualizar frontend** para usar nova API

Com esta implementação, o CapiFit ficará 100% funcional com banco de dados local!