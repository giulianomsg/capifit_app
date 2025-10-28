const express = require('express');

const router = express.Router();

// Mock data for users (replace with database queries)
const mockUsers = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@example.com',
    role: 'client',
    status: 'active',
    created_at: '2024-01-15'
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@example.com',
    role: 'trainer',
    status: 'active',
    created_at: '2024-02-20'
  }
];

const parseJSONParam = (value) => {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Não foi possível interpretar parâmetro JSON:', value);
    return undefined;
  }
};

const matchesFilters = (entity, filters) => {
  if (!filters || typeof filters !== 'object') return true;

  return Object.entries(filters).every(([key, value]) => {
    if (key === '$or' && Array.isArray(value)) {
      return value.some((condition) => matchesFilters(entity, condition));
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (value?.$in && Array.isArray(value.$in)) {
        return value.$in.includes(entity[key]);
      }

      if (value?.$eq !== undefined) {
        return entity[key] === value.$eq;
      }

      return Object.entries(value).every(([, nestedValue]) => entity[key] === nestedValue);
    }

    return entity[key] === value;
  });
};

// Get all users
router.get('/', (req, res) => {
  try {
    const { role, status, page = 1, limit = 10, where, orderBy } = req.query;

    let filteredUsers = [...mockUsers];

    const parsedWhere = parseJSONParam(where);
    const parsedOrder = parseJSONParam(orderBy);

    if (parsedWhere) {
      filteredUsers = filteredUsers.filter((user) => matchesFilters(user, parsedWhere));
    }

    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }

    if (status) {
      filteredUsers = filteredUsers.filter((user) => user.status === status);
    }

    if (parsedOrder && parsedOrder?.name) {
      const direction = String(parsedOrder.name).toLowerCase() === 'desc' ? -1 : 1;
      filteredUsers.sort((a, b) => a.name.localeCompare(b.name) * direction);
    }

    const numericLimit = Number(limit) || 10;
    const numericPage = Number(page) || 1;
    const startIndex = (numericPage - 1) * numericLimit;
    const endIndex = startIndex + numericLimit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    res.json({
      users: paginatedUsers,
      pagination: {
        currentPage: numericPage,
        totalPages: Math.ceil(filteredUsers.length / numericLimit) || 1,
        totalUsers: filteredUsers.length,
        hasNext: endIndex < filteredUsers.length,
        hasPrev: startIndex > 0,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Erro ao buscar usuários',
    });
  }
});

// Get user by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = mockUsers.find((u) => u?.id === parseInt(id, 10));

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Erro ao buscar usuário',
    });
  }
});

// Update user
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, status } = req.body;

    const userIndex = mockUsers.findIndex((u) => u?.id === parseInt(id, 10));

    if (userIndex === -1) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
      });
    }

    // Update user data
    if (name) mockUsers[userIndex].name = name;
    if (email) mockUsers[userIndex].email = email;
    if (status) mockUsers[userIndex].status = status;

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: mockUsers?.[userIndex],
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Erro ao atualizar usuário',
    });
  }
});

// Delete user
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userIndex = mockUsers.findIndex((u) => u?.id === parseInt(id, 10));

    if (userIndex === -1) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
      });
    }

    mockUsers.splice(userIndex, 1);

    res.json({
      message: 'Usuário removido com sucesso',
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Erro ao remover usuário',
    });
  }
});

module.exports = router;