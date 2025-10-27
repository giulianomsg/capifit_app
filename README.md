# CapiFit - Sistema Completo de Personal Training

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.x-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-teal.svg)](https://tailwindcss.com/)
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

## 📋 Pré-requisitos

### Ambiente de Desenvolvimento
- **Node.js** (v16.x ou superior)
- **npm** ou **yarn**

### Ambiente de Produção
- **VPS/Servidor** Ubuntu 20.04+ ou similar
- **Nginx** (servidor web)
- **PM2** (gerenciador de processos Node.js)
- **Banco de Dados**: MySQL/MariaDB OU PostgreSQL
- **SSL Certificate** (recomendado)

## 🛠️ Instalação Local (Desenvolvimento)

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/capifit.git
cd capifit
```

### 2. Instale as Dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure o Banco de Dados Local

#### Opção A: PostgreSQL (Recomendado)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar usuário e banco
sudo -u postgres psql
```

No console do PostgreSQL:
```sql
CREATE USER capifit_user WITH ENCRYPTED PASSWORD 'capifit_password';
CREATE DATABASE capifit_db OWNER capifit_user;
GRANT ALL PRIVILEGES ON DATABASE capifit_db TO capifit_user;
\q
```

Executar schema:
```bash
psql -U capifit_user -d capifit_db -f sql/postgresql/01_create_database.sql
psql -U capifit_user -d capifit_db -f sql/postgresql/02_create_tables.sql
psql -U capifit_user -d capifit_db -f sql/postgresql/03_sample_data.sql
```

#### Opção B: MySQL/MariaDB
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server
# ou MariaDB
sudo apt install mariadb-server

# Configuração inicial
sudo mysql_secure_installation
```

No console do MySQL:
```sql
CREATE USER 'capifit_user'@'localhost' IDENTIFIED BY 'capifit_password';
CREATE DATABASE capifit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON capifit_db.* TO 'capifit_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Executar schema:
```bash
mysql -u capifit_user -p capifit_db < sql/mysql/01_create_database.sql
mysql -u capifit_user -p capifit_db < sql/mysql/02_create_tables.sql
mysql -u capifit_user -p capifit_db < sql/mysql/03_sample_data.sql
```

### 4. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# Configuração do Banco
VITE_DB_TYPE=postgresql          # ou 'mysql'
VITE_DB_HOST=localhost
VITE_DB_PORT=5432               # ou 3306 para MySQL
VITE_DB_NAME=capifit_db
VITE_DB_USER=capifit_user
VITE_DB_PASSWORD=capifit_password
VITE_API_URL=http://localhost:3001

# JWT Secret (gere um token seguro)
VITE_JWT_SECRET=seu-jwt-secret-super-seguro-aqui

# Opcionais para funcionalidades extras
VITE_OPENAI_API_KEY=sua-chave-openai
VITE_GOOGLE_ANALYTICS_ID=seu-ga-id
```

### 5. Executar o Servidor de Desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

Acesse: `http://localhost:5173`

## 🚀 Instalação em Produção (VPS)

### 1. Preparar o Servidor

#### Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

#### Instalar Node.js
```bash
# Via NodeSource (recomendado)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

#### Instalar PM2
```bash
sudo npm install -g pm2
```

#### Instalar e Configurar Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Configurar Banco de Dados em Produção

#### PostgreSQL (Recomendado)
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar firewall
sudo ufw allow 5432/tcp

# Criar usuário e banco
sudo -u postgres createuser --createdb --pwprompt capifit_user
sudo -u postgres createdb -O capifit_user capifit_db
```

#### MySQL/MariaDB
```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Configurar firewall
sudo ufw allow 3306/tcp
```

### 3. Fazer Deploy da Aplicação

#### Clone e Build do Frontend
```bash
cd /var/www
sudo git clone https://github.com/seu-usuario/capifit.git
sudo chown -R $USER:$USER /var/www/capifit
cd capifit

# Instalar dependências e build
npm install
npm run build
```

#### Configurar Backend API
```bash
# Criar diretório do backend
mkdir capifit-backend
cd capifit-backend

# Seguir o guia completo em: backend-setup-guide.md
# Configurar Node.js + Express + Banco de Dados
```

#### Configurar PM2 para Backend
```bash
# No diretório do backend
pm2 start server.js --name capifit-api
pm2 startup
pm2 save
```

### 4. Configurar Nginx

Criar configuração do site:
```bash
sudo nano /etc/nginx/sites-available/capifit
```

Configuração do Nginx:
```nginx
# Frontend (React)
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    root /var/www/capifit/dist;
    index index.html;
    
    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API routes (proxy para backend)
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
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Ativar o site:
```bash
sudo ln -s /etc/nginx/sites-available/capifit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Configurar SSL (HTTPS)

#### Instalar Certbot
```bash
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
```

#### Obter Certificado SSL
```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

### 6. Configurar Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 5432/tcp  # PostgreSQL
# ou
sudo ufw allow 3306/tcp  # MySQL
sudo ufw enable
```

### 7. Configuração de Monitoramento

#### PM2 Monitoring
```bash
# Visualizar logs
pm2 logs capifit-api

# Monitorar recursos
pm2 monit

# Restart automático
pm2 startup
```

#### Backup Automático do Banco
```bash
# Criar script de backup
sudo nano /home/backup-capifit.sh
```

Script de backup:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/capifit"

# PostgreSQL
pg_dump -U capifit_user -h localhost capifit_db > "$BACKUP_DIR/capifit_db_$DATE.sql"

# MySQL (alternativo)
# mysqldump -u capifit_user -p capifit_db > "$BACKUP_DIR/capifit_db_$DATE.sql"

# Manter apenas últimos 7 backups
find $BACKUP_DIR -type f -name "*.sql" -mtime +7 -delete
```

Configurar cron:
```bash
sudo crontab -e

# Backup diário às 2:00
0 2 * * * /home/backup-capifit.sh
```

## 📱 Estrutura do Projeto

```
capifit/
├── public/                     # Arquivos públicos
├── src/
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                # Componentes de interface
│   │   └── ...
│   ├── pages/                  # Páginas da aplicação
│   │   ├── dashboard-principal/
│   │   ├── gerenciar-alunos/
│   │   ├── exercise-library/
│   │   ├── physical-assessment-system/
│   │   ├── criar-treinos/
│   │   ├── nutrition-management/
│   │   ├── chat-communication-hub/
│   │   └── notification-center/
│   ├── lib/                    # Utilitários e configurações
│   │   └── database.js         # Configuração do banco
│   ├── hooks/                  # Custom hooks React
│   └── styles/                 # Estilos globais
├── sql/                        # Schemas de banco de dados
│   ├── mysql/                  # Scripts MySQL/MariaDB
│   └── postgresql/             # Scripts PostgreSQL
├── backend-setup-guide.md      # Guia completo do backend
└── ...
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build local
npm run lint         # Executar linting
```

## 🔐 Autenticação e Segurança

- **JWT Authentication** - Tokens seguros com expiração
- **Bcrypt Passwords** - Hash seguro de senhas
- **Role-based Access** - Controle por perfis (trainer/client/admin)
- **Input Validation** - Sanitização de dados de entrada
- **SQL Injection Protection** - Queries preparadas
- **HTTPS Enforced** - Comunicação criptografada
- **Rate Limiting** - Proteção contra ataques

## 📊 Funcionalidades Técnicas

### Frontend (React)
- **React 18** com Hooks e Context API
- **Vite** para build rápida e HMR
- **TailwindCSS** para styling responsivo
- **React Router** para navegação SPA
- **React Hook Form** para formulários eficientes
- **Recharts/D3.js** para visualizações
- **Framer Motion** para animações

### Backend Options
- **Node.js + Express** (Recomendado)
- **PHP + Laravel** (Alternativo)
- **Python + FastAPI** (Alternativo)

### Banco de Dados
- **PostgreSQL** (Recomendado) - Robusto e confiável
- **MySQL/MariaDB** - Alternativa popular e eficiente
- **Schemas completos** com dados de exemplo
- **Relacionamentos otimizados** para performance

## 🚀 Performance e Otimização

- **Lazy Loading** de componentes
- **Code Splitting** automático
- **Caching** de assets estáticos
- **Compressão Gzip/Brotli**
- **CDN Ready** para assets
- **Database Indexing** otimizado
- **API Rate Limiting**

## 📈 Monitoramento e Analytics

- **PM2 Process Monitoring**
- **Nginx Access Logs**
- **Database Performance Metrics**
- **Error Tracking Integration Ready**
- **Google Analytics Integration**

## 🔄 Updates e Manutenção

### Atualizar Aplicação
```bash
# Fazer backup
pm2 stop capifit-api
pg_dump capifit_db > backup_$(date +%Y%m%d).sql

# Atualizar código
git pull origin main
npm install
npm run build

# Restart
pm2 restart capifit-api
```

### Monitorar Logs
```bash
# Backend logs
pm2 logs capifit-api

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Database logs (PostgreSQL)
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verificar se o serviço está rodando
   - Conferir credenciais no `.env`
   - Verificar firewall/portas

2. **Frontend não carrega**
   - Verificar se o build foi feito
   - Conferir configuração do Nginx
   - Verificar permissões de arquivos

3. **API não responde**
   - Verificar se PM2 está rodando
   - Conferir logs com `pm2 logs`
   - Verificar porta 3001

### Comandos Úteis
```bash
# Status dos serviços
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Verificar portas em uso
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :5432

# Restart completo
sudo systemctl restart nginx
sudo systemctl restart postgresql
pm2 restart all
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte e dúvidas:
- 📧 Email: suporte@capifit.com
- 📱 WhatsApp: (11) 99999-9999
- 📖 Documentação: [docs.capifit.com]
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/capifit/issues)

---

**CapiFit** - Transformando o futuro do Personal Training 💪

Built with ❤️ using React, Node.js e muito café ☕