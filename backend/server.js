const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env?.PORT || 3001;

const SKIP_DB_CONNECTION = process.env?.SKIP_DB_CONNECTION === 'true';

const allowedOrigins = (process.env?.FRONTEND_URLS || process.env?.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Database connection
const dbConfig = {
  type: process.env?.VITE_DB_TYPE || 'mysql',
  host: process.env?.VITE_DB_HOST,
  port: process.env?.VITE_DB_PORT || (process.env?.VITE_DB_TYPE === 'postgresql' ? 5432 : 3306),
  database: process.env?.VITE_DB_NAME,
  user: process.env?.VITE_DB_USER,
  password: process.env?.VITE_DB_PASSWORD,
};

let db;
let dbStatus = {
  connected: false,
  skipped: SKIP_DB_CONNECTION,
  type: dbConfig.type,
  error: null,
};

async function connectDatabase() {
  if (SKIP_DB_CONNECTION) {
    console.warn('⚠️  SKIP_DB_CONNECTION habilitado - continuando sem conectar ao banco de dados.');
    return;
  }

  if (!dbConfig?.host || !dbConfig?.database || !dbConfig?.user) {
    console.warn('⚠️  Variáveis de ambiente do banco de dados ausentes. Inicie com SKIP_DB_CONNECTION=true para ocultar este aviso.');
    dbStatus.error = new Error('Database environment variables are missing');
    return;
  }

  try {
    if (dbConfig?.type === 'postgresql') {
      const { Client } = require('pg');
      db = new Client({
        host: dbConfig.host,
        port: Number(dbConfig.port) || 5432,
        database: dbConfig.database,
        user: dbConfig.user,
        password: dbConfig.password,
      });
      await db.connect();
      console.log('✅ Conectado ao PostgreSQL');
    } else {
      const mysql = require('mysql2/promise');
      db = await mysql.createConnection({
        host: dbConfig?.host,
        port: Number(dbConfig?.port) || 3306,
        database: dbConfig?.database,
        user: dbConfig?.user,
        password: dbConfig?.password,
      });
      console.log('✅ Conectado ao MySQL');
    }

    dbStatus.connected = true;
    dbStatus.error = null;
  } catch (error) {
    db = null;
    dbStatus.connected = false;
    dbStatus.error = error;
    console.error('❌ Erro na conexão com o banco de dados:', error?.message || error);
    console.warn('➡️  Continuando a inicialização com dados mock. Defina SKIP_DB_CONNECTION=true para ocultar este aviso.');
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CapiFit Backend está funcionando!',
    timestamp: new Date().toISOString(),
    database: {
      type: dbConfig?.type,
      connected: dbStatus.connected,
      skipped: dbStatus.skipped,
      error: dbStatus.error ? dbStatus.error.message : null,
    },
  });
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  if (!dbStatus.connected || !db) {
    return res.status(503).json({
      status: 'unavailable',
      message: 'Conexão com o banco de dados não está ativa',
    });
  }

  try {
    if (dbConfig?.type === 'postgresql') {
      const result = await db.query('SELECT NOW() as current_time');
      res.json({
        status: 'success',
        database: 'PostgreSQL',
        time: result?.rows?.[0]?.current_time,
      });
    } else {
      const [rows] = await db.execute('SELECT NOW() as current_time');
      res.json({
        status: 'success',
        database: 'MySQL',
        time: rows?.[0]?.current_time,
      });
    }
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro na conexão com o banco de dados',
      error: error?.message,
    });
  }
});

// API routes will be added here
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/workouts', require('./routes/workouts'));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(error?.status || 500).json({
    error: 'Internal Server Error',
    message: error?.message,
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Endpoint não encontrado',
  });
});

// Start server
async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 CapiFit Backend rodando na porta ${PORT}`);
    console.log(`📊 Banco de dados: ${dbStatus.connected ? dbConfig?.type?.toUpperCase() : 'DESCONHECIDO/INATIVO'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
  });
}

startServer().catch(error => {
  console.error('Falha ao iniciar o servidor:', error);
});

module.exports = app;
