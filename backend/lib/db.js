const mysql = require('mysql2/promise');
const { Client } = require('pg');

const SKIP_DB_CONNECTION = process.env?.SKIP_DB_CONNECTION === 'true';

const dbConfig = {
  type: process.env?.VITE_DB_TYPE || 'mysql',
  host: process.env?.VITE_DB_HOST,
  port: process.env?.VITE_DB_PORT,
  database: process.env?.VITE_DB_NAME,
  user: process.env?.VITE_DB_USER,
  password: process.env?.VITE_DB_PASSWORD,
};

let pool = null;
let pgClient = null;

function getConnectionConfig() {
  if (dbConfig.type === 'postgresql') {
    return {
      host: dbConfig.host,
      port: Number(dbConfig.port) || 5432,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
    };
  }

  return {
    host: dbConfig.host,
    port: Number(dbConfig.port) || 3306,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password,
    waitForConnections: true,
    connectionLimit: Number(process.env?.DB_POOL_MAX || 10),
    queueLimit: 0,
    namedPlaceholders: true,
  };
}

async function initDatabase() {
  if (SKIP_DB_CONNECTION) {
    return { connected: false, skipped: true, error: null };
  }

  if (!dbConfig?.host || !dbConfig?.database || !dbConfig?.user) {
    const error = new Error('Database environment variables are missing');
    return { connected: false, skipped: false, error };
  }

  try {
    if (dbConfig.type === 'postgresql') {
      const config = getConnectionConfig();
      pgClient = new Client(config);
      await pgClient.connect();
      return { connected: true, skipped: false, error: null };
    }

    const config = getConnectionConfig();
    pool = mysql.createPool(config);
    await pool.query('SELECT 1');
    return { connected: true, skipped: false, error: null };
  } catch (error) {
    pool = null;
    pgClient = null;
    return { connected: false, skipped: false, error };
  }
}

function isPostgres() {
  return dbConfig.type === 'postgresql';
}

async function query(sql, params = []) {
  if (SKIP_DB_CONNECTION) {
    throw new Error('Database connection skipped (SKIP_DB_CONNECTION=true)');
  }

  if (isPostgres()) {
    if (!pgClient) {
      throw new Error('PostgreSQL client not initialized');
    }
    const result = await pgClient.query(sql, params);
    return [result.rows, result];
  }

  if (!pool) {
    throw new Error('MySQL pool not initialized');
  }

  return pool.query(sql, params);
}

async function getConnection() {
  if (SKIP_DB_CONNECTION) {
    throw new Error('Database connection skipped (SKIP_DB_CONNECTION=true)');
  }

  if (isPostgres()) {
    if (!pgClient) {
      throw new Error('PostgreSQL client not initialized');
    }
    return pgClient;
  }

  if (!pool) {
    throw new Error('MySQL pool not initialized');
  }

  return pool.getConnection();
}

async function closeDatabase() {
  if (pgClient) {
    await pgClient.end();
    pgClient = null;
  }

  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  initDatabase,
  closeDatabase,
  query,
  getConnection,
  dbConfig,
  SKIP_DB_CONNECTION,
};
