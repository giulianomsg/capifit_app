const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env?.JWT_SECRET || 'capifit_secret_key_change_in_production';

// Mock user data (replace with actual database queries)
const mockUsers = [
  {
    id: 1,
    email: 'admin@capifit.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    name: 'Administrador',
  },
];

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' },
  );

async function handleLogin(email, password) {
  const user = mockUsers.find((u) => u.email === email);

  if (!user) {
    return { error: 'Credenciais inválidas' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return { error: 'Credenciais inválidas' };
  }

  const token = generateToken(user);

  return {
    token,
    user: sanitizeUser(user),
  };
}

async function handleRegistration({ name, email, password, role }) {
  const normalizedEmail = email?.toLowerCase();
  const existingUser = mockUsers.find((u) => u.email === normalizedEmail);

  if (existingUser) {
    return { error: 'Usuário já existe com este email' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: mockUsers.length + 1,
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: role || 'client',
  };

  mockUsers.push(newUser);

  const token = generateToken(newUser);

  return {
    token,
    user: sanitizeUser(newUser),
  };
}

// Login route aliases
router.post(['/login', '/signin'], async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios',
      });
    }

    const result = await handleLogin(email, password);

    if (result.error) {
      return res.status(401).json({ error: result.error });
    }

    res.json({
      message: 'Login realizado com sucesso',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Register route aliases
router.post(['/register', '/signup'], async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Nome, email e senha são obrigatórios',
      });
    }

    const result = await handleRegistration({ name, email, password, role });

    if (result.error) {
      return res.status(409).json({ error: result.error });
    }

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
});

// Verify token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers?.authorization;
  const token = authHeader && authHeader.split(' ')?.[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = sanitizeUser(user);
    next();
  });
};

router.post('/signout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// Protected route example
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    message: 'Dados do usuário autenticado',
    user: req.user,
  });
});

module.exports = router;