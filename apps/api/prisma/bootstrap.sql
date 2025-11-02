DO $$
BEGIN
  CREATE ROLE capifit_user LOGIN PASSWORD 'CAPIFIT_STRONG_PASSWORD';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'role capifit_user already exists, skipping';
END
$$;

DO $$
BEGIN
  CREATE DATABASE capifit_db OWNER capifit_user;
EXCEPTION
  WHEN duplicate_database THEN
    RAISE NOTICE 'database capifit_db already exists, skipping';
END
$$;

GRANT ALL PRIVILEGES ON DATABASE capifit_db TO capifit_user;
