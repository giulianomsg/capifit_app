#!/usr/bin/env bash
set -euo pipefail

# ---- Perguntas interativas ----
read -rp "Postgres host [localhost]: " PGHOST_INPUT
PGHOST="${PGHOST_INPUT:-localhost}"

read -rp "Postgres port [5432]: " PGPORT_INPUT
PGPORT="${PGPORT_INPUT:-5432}"

read -rp "Postgres admin user [postgres]: " PGADMIN_INPUT
PGADMIN="${PGADMIN_INPUT:-postgres}"

read -s -p "Senha do superusuário Postgres (deixe vazio se não precisar): " PGPASS_ADMIN
echo

read -rp "Nome do usuário da aplicação [capifit_user]: " APPUSER_INPUT
APPUSER="${APPUSER_INPUT:-capifit_user}"

read -s -p "Senha do usuário da aplicação: " APPPASS
echo

if [[ -z "${APPPASS}" ]]; then
  echo "A senha do usuário da aplicação é obrigatória." >&2
  exit 1
fi

read -rp "Nome do banco da aplicação [capifit_db]: " APPDB_INPUT
APPDB="${APPDB_INPUT:-capifit_db}"

read -rp "Nome do shadow database [capifit_shadow]: " SHADOWDB_INPUT
SHADOWDB="${SHADOWDB_INPUT:-capifit_shadow}"

# ---- Conexão admin ----
export PGHOST PGPORT
if [[ -n "${PGPASS_ADMIN}" ]]; then
  export PGPASSWORD="${PGPASS_ADMIN}"
else
  unset PGPASSWORD || true
fi

# ---- Função psql admin ----
psql_admin() {
  psql -v ON_ERROR_STOP=1 -U "${PGADMIN}" "$@"
}

# ---- Criação/ajuste de ROLE e DATABASES com quoting seguro ----
psql_admin -h "${PGHOST}" -p "${PGPORT}" -v APPUSER="${APPUSER}" -v APPPASS="${APPPASS}" <<'SQL'
SELECT format($fmt$
DO $$
DECLARE
  v_user text := %1$L;
  v_pass text := %2$L;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = v_user) THEN
    EXECUTE format('CREATE ROLE %%I LOGIN PASSWORD %%L', v_user, v_pass);
  ELSE
    EXECUTE format('ALTER ROLE %%I WITH LOGIN PASSWORD %%L', v_user, v_pass);
  END IF;
END $$;
$fmt$, :'APPUSER', :'APPPASS');
\gexec
SQL

psql_admin -h "${PGHOST}" -p "${PGPORT}" -v APPUSER="${APPUSER}" -v APPDB="${APPDB}" <<'SQL'
SELECT format($fmt$
DO $$
DECLARE
  v_db text := %1$L;
  v_user text := %2$L;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = v_db) THEN
    EXECUTE format('CREATE DATABASE %%I OWNER %%I', v_db, v_user);
  ELSE
    EXECUTE format('ALTER DATABASE %%I OWNER TO %%I', v_db, v_user);
  END IF;
END $$;
$fmt$, :'APPDB', :'APPUSER');
\gexec
SQL

psql_admin -h "${PGHOST}" -p "${PGPORT}" -v APPUSER="${APPUSER}" -v SHADOWDB="${SHADOWDB}" <<'SQL'
SELECT format($fmt$
DO $$
DECLARE
  v_db text := %1$L;
  v_user text := %2$L;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = v_db) THEN
    EXECUTE format('CREATE DATABASE %%I OWNER %%I', v_db, v_user);
  ELSE
    EXECUTE format('ALTER DATABASE %%I OWNER TO %%I', v_db, v_user);
  END IF;
END $$;
$fmt$, :'SHADOWDB', :'APPUSER');
\gexec
SQL

psql_admin -h "${PGHOST}" -p "${PGPORT}" -d "${APPDB}" -v APPUSER="${APPUSER}" <<'SQL'
GRANT ALL ON SCHEMA public TO PUBLIC;
GRANT ALL ON SCHEMA public TO :APPUSER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO :APPUSER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO :APPUSER;
SQL

unset PGPASSWORD || true

ENV_FILE="apps/api/.env"
TEMPLATE_FILE="apps/api/.env.example"

if [[ ! -f "${TEMPLATE_FILE}" ]]; then
  echo "Template ${TEMPLATE_FILE} não encontrado." >&2
  exit 1
fi

cp -f "${TEMPLATE_FILE}" "${ENV_FILE}"

ESC_PASS=$(printf '%s' "${APPPASS}" | sed -e 's/[&/\\]/\\&/g')
sed -i "s/__ASK_AT_RUNTIME__/${ESC_PASS}/g" "${ENV_FILE}"

if [[ "${PGHOST}" != "localhost" || "${PGPORT}" != "5432" ]]; then
  sed -i "s#@localhost:5432/#@${PGHOST}:${PGPORT}/#g" "${ENV_FILE}"
fi

echo "Arquivo ${ENV_FILE} atualizado localmente. (NÃO será commitado)"
echo "Provisionamento do banco concluído com sucesso."
