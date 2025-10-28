const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { initDatabase, query, dbConfig, SKIP_DB_CONNECTION } = require('./lib/db');

const app = express();
const server = http.createServer(app);
const PORT = process.env?.PORT || 3001;

const allowedOrigins = (process.env?.FRONTEND_URLS || process.env?.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

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

// API routes will be added here
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/menus', require('./routes/menus'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));

io.on('connection', (socket) => {
  socket.on('chat:join', ({ roomId }) => {
    if (roomId) {
      socket.join(roomId);
    }
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
});

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

  server.listen(PORT, () => {
    console.log(`🚀 CapiFit Backend rodando na porta ${PORT}`);
    console.log(`📊 Banco de dados: ${dbStatus.connected ? dbConfig?.type?.toUpperCase() : 'DESCONHECIDO/INATIVO'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
  });
}

startServer().catch(error => {
  console.error('Falha ao iniciar o servidor:', error);
});

module.exports = app;
