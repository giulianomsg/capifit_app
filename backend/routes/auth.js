const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express?.Router();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env?.JWT_SECRET || 'capifit_secret_key_change_in_production';

// Mock user data (replace with actual database queries)
const mockUsers = [
  {
    id: 1,
    email: 'admin@capifit.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    name: 'Administrador'
  }
];

// Login route
router?.post('/login', async (req, res) => {
  try {
    const { email, password } = req?.body;

    if (!email || !password) {
      return res?.status(400)?.json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Find user (replace with database query)
    const user = mockUsers?.find(u => u?.email === email);
    
    if (!user) {
      return res?.status(401)?.json({ 
        error: 'Credenciais inválidas' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt?.compare(password, user?.password);
    
    if (!isPasswordValid) {
      return res?.status(401)?.json({ 
        error: 'Credenciais inválidas' 
      });
    }

    // Generate JWT token
    const token = jwt?.sign(
      { 
        id: user?.id, 
        email: user?.email, 
        role: user?.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res?.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        role: user?.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res?.status(500)?.json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

// Register route
router?.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req?.body;

    if (!name || !email || !password) {
      return res?.status(400)?.json({ 
        error: 'Nome, email e senha são obrigatórios' 
      });
    }

    // Check if user exists (replace with database query)
    const existingUser = mockUsers?.find(u => u?.email === email);
    
    if (existingUser) {
      return res?.status(409)?.json({ 
        error: 'Usuário já existe com este email' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt?.hash(password, 10);

    // Create new user (replace with database insert)
    const newUser = {
      id: mockUsers?.length + 1,
      name,
      email,
      password: hashedPassword,
      role: role || 'client'
    };

    mockUsers?.push(newUser);

    // Generate JWT token
    const token = jwt?.sign(
      { 
        id: newUser?.id, 
        email: newUser?.email, 
        role: newUser?.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res?.status(201)?.json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: newUser?.id,
        email: newUser?.email,
        name: newUser?.name,
        role: newUser?.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res?.status(500)?.json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

// Verify token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req?.headers?.['authorization'];
  const token = authHeader && authHeader?.split(' ')?.[1];

  if (!token) {
    return res?.status(401)?.json({ error: 'Token de acesso requerido' });
  }

  jwt?.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res?.status(403)?.json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Protected route example
router?.get('/me', authenticateToken, (req, res) => {
  res?.json({
    message: 'Dados do usuário autenticado',
    user: req?.user
  });
});

module.exports = router;