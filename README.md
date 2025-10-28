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
7. Executar o script `scripts/deploy/install_or_update.sh` para publicar o frontend, configurar Nginx e PM2.
8. (Opcional) Emitir o certificado SSL via Certbot manualmente ou pela flag `REQUEST_CERT=true` no script.
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

> **Atalho:** o passo seguinte automatiza essa configuração com `scripts/deploy/install_or_update.sh`, então você pode pular esta etapa manual caso prefira usar o script diretamente.

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

## ✅ 10. Configurar Nginx e PM2 com o script de deploy

O repositório inclui:

- Template Nginx em `config/nginx/capifit.app.br.conf` (baseado em HTTPS, assets com cache longo e proxy para `/api`).
- Script automatizado em `scripts/deploy/install_or_update.sh` que instala pacotes, gera o build do frontend, substitui variáveis no template e (re)inicia o PM2.

Antes de executar, ajuste as variáveis de ambiente conforme sua infraestrutura:

| Variável | Descrição | Padrão |
| --- | --- | --- |
| `DOMAIN` | Domínio principal (sem protocolo). | `capifit.app.br` |
| `BACKEND_PORT` | Porta do backend Node.js/Express. | `3001` |
| `BUILD_DIR` | Diretório onde ficará o build do frontend. | `/var/www/capifit_app/build` |
| `PHP_FPM_SOCKET` | Socket PHP-FPM usado pelo phpMyAdmin opcional. | `/run/php/php8.3-fpm.sock` |
| `REQUEST_CERT` | Quando `true`, executa `certbot --nginx` após gerar o site. | `false` |
| `CERTBOT_EMAIL` | E-mail administrativo para o Certbot (usado se `REQUEST_CERT=true`). | `admin@${DOMAIN}` |

Execute o script (como `root` ou `sudo`):
```bash
cd /var/www/capifit_app
sudo DOMAIN=capifit.app.br \
     BACKEND_PORT=3001 \
     BUILD_DIR=/var/www/capifit_app/build \
     PHP_FPM_SOCKET=/run/php/php8.3-fpm.sock \
     REQUEST_CERT=false \
     ./scripts/deploy/install_or_update.sh
```

O script realiza automaticamente:

1. `apt-get update` e instalação de `nginx`, `certbot`, `php-fpm`, `php-mysql`.
2. `npm ci` (ou `npm install`) seguido de `npm run build`.
3. Substituição das variáveis no template e publicação em `/etc/nginx/sites-available/${DOMAIN}.conf` com link simbólico em `sites-enabled`.
4. `nginx -t` e `systemctl reload nginx`.
5. Instalação do `pm2` (se necessário), criação/recarga do processo `capifit-backend`, `pm2 save` e `pm2 startup`.

Se quiser solicitar o certificado SSL automaticamente, defina `REQUEST_CERT=true` (o domínio precisa apontar para o servidor):
```bash
sudo REQUEST_CERT=true CERTBOT_EMAIL=seu-email@dominio.com ./scripts/deploy/install_or_update.sh
```

O script pode ser executado novamente sempre que houver atualizações de código; ele recompila o frontend e recarrega Nginx/PM2 de forma idempotente.

---

## ✅ 11. (Opcional) Emitir Certificado SSL manualmente
Caso não utilize a flag `REQUEST_CERT=true`, execute manualmente:
```bash
sudo certbot --nginx -d capifit.app.br -d www.capifit.app.br
sudo systemctl status certbot.timer || sudo systemctl status snap.certbot.renew.timer
```
Verifique se o timer de renovação automática está habilitado.

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
# Atualizar código e redeploy (idempotente)
cd /var/www/capifit_app
git pull origin main
sudo ./scripts/deploy/install_or_update.sh

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
