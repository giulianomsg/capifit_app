const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../lib/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env?.JWT_SECRET || 'capifit_secret_key_change_in_production';
const TOKEN_EXPIRES_IN = process.env?.JWT_EXPIRES_IN || '24h';

function sanitizeUser(record) {
  if (!record) return null;
  return {
    id: record.id,
    email: record.email,
    full_name: record.full_name,
    name: record.full_name,
    role: record.role,
    phone: record.phone,
    avatar_url: record.avatar_url,
    is_active: record.is_active === undefined ? true : !!record.is_active,
  };
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

async function findUserByEmail(email) {
  const [rows] = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email?.toLowerCase()]);
  return rows?.[0];
}

router.post(['/login', '/signin'], async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    if (user.is_active === false) {
      return res.status(403).json({ message: 'Conta desativada. Contate o administrador.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erro interno ao realizar login' });
  }
});

router.post(['/register', '/signup'], async (req, res) => {
  try {
    const { full_name, name, email, password, role = 'client', phone } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ message: 'Já existe um usuário com este email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const payload = {
      email: normalizedEmail,
      password_hash: passwordHash,
      role,
      full_name: full_name || name || '',
      phone: phone || null,
    };

    const insertSql = `
      INSERT INTO users (id, email, password_hash, role, full_name, phone)
      VALUES (UUID(), ?, ?, ?, ?, ?)
    `;

    await query(insertSql, [
      payload.email,
      payload.password_hash,
      payload.role,
      payload.full_name,
      payload.phone,
    ]);

    const createdUser = await findUserByEmail(payload.email);

    const token = generateToken(createdUser);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: sanitizeUser(createdUser),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Erro interno ao cadastrar usuário' });
  }
});

router.post('/signout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [req.user?.id])
      .then(([rows]) => rows?.[0])
      .then(sanitizeUser);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Fetch current user error:', error);
    res.status(500).json({ message: 'Erro interno ao buscar usuário' });
  }
});

module.exports = router;
