// /var/www/capifit_app/backend/server.js
// Backend HTTP + Express + Socket.IO para CapiFit

require('dotenv').config(); // carrega .env na raiz (precisa que PM2 rode com cwd do projeto)

const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const { initDatabase, query, dbConfig, SKIP_DB_CONNECTION } = require('./lib/db');

// --------- Configurações básicas ---------
const app = express();
const PROJECT_ROOT = path.resolve(__dirname, '..');

// CORS: ajuste conforme sua necessidade (origens permitidas)
const defaultOrigins = [
  'https://capifit.app.br',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const envOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const ORIGINS = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(cors({
  origin: (origin, cb) => {
    // permite chamadas sem origin (ex.: curl) e verifica whitelist
    if (!origin || ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

let dbStatus = {
  connected: false,
  skipped: SKIP_DB_CONNECTION,
  type: dbConfig.type,
  error: null,
};

async function connectDatabase() {
  const result = await initDatabase();

  dbStatus = {
    connected: result.connected,
    skipped: result.skipped,
    type: dbConfig.type,
    error: result.error,
  };

  if (result.error) {
    console.error('❌ Erro na conexão com o banco de dados:', result.error?.message || result.error);
    if (!result.skipped) {
      console.warn('➡️  Continuando a inicialização sem dados persistentes. Verifique as credenciais do banco.');
    }
  } else if (result.connected) {
    console.log(`✅ Conectado ao banco ${dbConfig.type}`);
  } else if (result.skipped) {
    console.warn('⚠️  SKIP_DB_CONNECTION habilitado - continuando sem conectar ao banco de dados.');
  }
}

// --------- Healthcheck ---------
app.get('/api/health', async (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'CapiFit Backend está funcionando!',
    timestamp: new Date().toISOString(),
    paths: {
      root: PROJECT_ROOT,
    },
    database: {
      type: dbConfig?.type || process.env.DB_TYPE || 'mysql',
      connected: dbStatus.connected,
      skipped: dbStatus.skipped,
      error: dbStatus.error ? dbStatus.error.message : null,
    }
  });
});

// Test database connection endpoint
app.get('/api/test-db', async (_req, res) => {
  if (!dbStatus.connected) {
    return res.status(503).json({
      status: 'unavailable',
      message: 'Conexão com o banco de dados não está ativa',
    });
  }

  try {
    const [rows] = await query('SELECT NOW() as current_time');
    const row = Array.isArray(rows) ? rows[0] : rows;
    res.json({
      status: 'success',
      database: dbConfig?.type,
      time: row?.current_time || row?.now,
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro na conexão com o banco de dados',
      error: error?.message,
    });
  }
});

// --------- API Routes ---------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/menus', require('./routes/menus'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));

// --------- HTTP + Socket.IO ---------
const server = http.createServer(app);

// Porta por argumento (ex.: "node server.js 3001") ou .env (PORT) ou 3001
const argPort = Number(process.argv[2]);
const PORT = Number.isFinite(argPort) ? argPort : Number(process.env.PORT || 3001);

// Inicializa Socket.IO no mesmo servidor HTTP
const io = new Server(server, {
  cors: {
    origin: ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Namespaces/salas podem ser criados conforme sua regra
io.on('connection', (socket) => {
  const uid = socket.handshake.query?.uid || 'guest';

  console.log(`[socket] client connected: id=${socket.id} uid=${uid}`);

  socket.on('chat:join', (roomId) => {
    if (!roomId) return;
    const roomKey = String(roomId);
    socket.join(roomKey);
    socket.emit('chat:joined', { roomId: roomKey });
  });

  socket.on('chat:send', async (payload, callback) => {
    try {
      if (!payload?.sender_id || !payload?.receiver_id || !payload?.content) {
        throw new Error('Dados da mensagem incompletos');
      }

      const insertSql = `
        INSERT INTO messages (id, sender_id, receiver_id, content, message_type, file_url)
        VALUES (UUID(), ?, ?, ?, ?, ?)
      `;

      await query(insertSql, [
        payload.sender_id,
        payload.receiver_id,
        payload.content,
        payload.message_type || 'text',
        payload.file_url || null,
      ]);

      const [rows] = await query(
        `SELECT * FROM messages WHERE sender_id = ? AND receiver_id = ? ORDER BY created_at DESC LIMIT 1`,
        [payload.sender_id, payload.receiver_id]
      );

      const message = rows?.[0];

      const roomKey = [payload.sender_id, payload.receiver_id].sort().join(':');
      io.to(roomKey).emit('chat:receive', message);

      callback?.({ status: 'ok', message });
    } catch (error) {
      console.error('Socket message error:', error);
      callback?.({ status: 'error', message: error?.message || 'Erro ao enviar mensagem' });
    }
  });

  socket.on('chat:message', (payload) => {
    if (!payload?.roomId || !payload?.text) return;
    const msg = {
      roomId: String(payload.roomId),
      text: String(payload.text),
      from: String(payload.from || uid),
      ts: Date.now()
    };
    io.to(msg.roomId).emit('chat:message', msg);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[socket] client disconnected: id=${socket.id} reason=${reason}`);
  });
});

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error('Server Error:', error);
  res.status(error?.status || 500).json({
    error: 'Internal Server Error',
    message: error?.message,
  });
});

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Endpoint não encontrado',
  });
});

async function startServer() {
  await connectDatabase();

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`CapiFit backend iniciado em http://127.0.0.1:${PORT}`);
    console.log(`📊 Banco de dados: ${dbStatus.connected ? dbConfig?.type?.toUpperCase() : 'DESCONHECIDO/INATIVO'}`);
    console.log(`🔗 API: http://127.0.0.1:${PORT}/api`);
  });
}

startServer().catch((error) => {
  console.error('Falha ao iniciar o servidor:', error);
});

// Encerramento gracioso
function shutdown(signal) {
  console.log(`${signal} recebido. Encerrando servidor...`);
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = { app, server };
