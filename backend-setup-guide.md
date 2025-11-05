# 🚀 Guia completo de instalação do backend CapiFit (Express + Prisma)

Este documento descreve o passo a passo para instalar e executar a API localizada em `apps/api`. O objetivo é garantir que, ao final, você consiga rodar `npm run build --workspace apps/api` sem erros, com banco de dados provisionado e variáveis de ambiente configuradas.

---

## 1. Pré-requisitos

| Ferramenta             | Versão mínima | Comando para verificar |
|------------------------|---------------|------------------------|
| Node.js                | 20.x          | `node -v`              |
| npm                    | 10.x          | `npm -v`               |
| PostgreSQL             | 14.x          | `psql --version`       |
| Redis (opcional em dev)| 6.x           | `redis-server --version` |

> 💡 Use `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -` seguido de `sudo apt install -y nodejs` para instalar Node.js + npm no Ubuntu 22.04.

---

## 2. Preparar o projeto

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/giulianomsg/capifit_app.git
   cd capifit_app
   ```

2. **Limpeza opcional (se já existirem instalações antigas)**
   ```bash
   rm -rf node_modules apps/api/node_modules package-lock.json apps/api/package-lock.json
   npm cache clean --force
   ```

3. **Instalar dependências**
   ```bash
   npm install
   ```
   O `package.json` raiz habilita workspaces; portanto, esse comando instala as dependências compartilhadas e das pastas `apps/api` e `apps/web` em uma única etapa.

---

## 3. Variáveis de ambiente da API

1. **Gerar `.env` automaticamente (recomendado)**
   ```bash
   npm run db:bootstrap --workspace apps/api
   ```
   Esse script:
   - Copia `apps/api/.env.example` para `apps/api/.env`.
   - Solicita host, porta, usuário e senha do PostgreSQL.
   - Cria os bancos `capifit_db` e `capifit_shadow` usando `psql`.

2. **Configuração manual (alternativa)**
   - Copie o template: `cp apps/api/.env.example apps/api/.env`.
   - Atualize os campos obrigatórios:
     - `DATABASE_URL` e `SHADOW_DATABASE_URL`
     - `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET`
     - `REDIS_URL` (opcional em desenvolvimento)
     - `SMTP_*` conforme seu provedor de e-mail
   - Caso precise criar o banco manualmente, execute `psql -f apps/api/prisma/bootstrap.sql` com um usuário PostgreSQL com permissão.

---

## 4. Preparar banco e cliente Prisma

Dentro da raiz do repositório execute:

```bash
npm run generate --workspace apps/api   # Gera o Prisma Client
npm run migrate --workspace apps/api    # Aplica migrações em capifit_db
npm run seed --workspace apps/api       # Insere usuários, planos e dados padrão
```

Se estiver em desenvolvimento local e não quiser Redis, mantenha `REDIS_URL` vazio. A API usa um fallback síncrono para envio de e-mails quando a fila BullMQ não está disponível.

---

## 5. Rodando a API

### 5.1 Desenvolvimento

```bash
npm run dev --workspace apps/api
```

O servidor ficará disponível em `http://localhost:3001`. Verifique `http://localhost:3001/health` para confirmar o status. Logs detalhados são exibidos diretamente no terminal através do Pino.

### 5.2 Testes e lint

```bash
npm run test --workspace apps/api   # Vitest + Supertest
npm run lint --workspace apps/api   # ESLint (erro se houver warnings)
```

### 5.3 Build de produção

```bash
npm run build --workspace apps/api
```

O comando utiliza `tsup` para gerar os arquivos ESM em `apps/api/dist`. Rode `node dist/server.js` (ou use PM2) apontando para o `.env` preparado anteriormente.

---

## 6. Troubleshooting rápido

| Sintoma | Como resolver |
|---------|---------------|
| `error TS2322` ao compilar | Execute `npm run generate --workspace apps/api` para garantir que o Prisma Client mais recente foi gerado e as tipagens estão sincronizadas. |
| `PrismaClientInitializationError` | Verifique se `DATABASE_URL` está correto e se o banco está acessível. Rodar `npm run migrate --workspace apps/api` ajuda a validar a conexão. |
| Falha ao instalar dependências (`ETIMEDOUT`, `EAI_AGAIN`) | Configure um registry espelhado com `npm config set registry <url>` ou libere `https://registry.npmjs.org` no firewall/proxy. |
| Erros ao enviar e-mail em desenvolvimento | Deixe `ENABLE_EMAIL_NOTIFICATIONS=false` ou configure credenciais válidas (`SMTP_HOST`, `SMTP_USER`, etc.). |

---

## 7. Próximos passos

- Integre com o frontend executando `npm run dev --workspace apps/web` e configure `VITE_API_URL` apontando para `http://localhost:3001`.
- Para produção, siga o guia `setup-capifit-production.md`, que cobre Docker Compose, PM2, Nginx e boas práticas de segurança.

Com esses passos, o backend estará pronto para atender as rotas REST da plataforma CapiFit com as tipagens e dependências corretas.
