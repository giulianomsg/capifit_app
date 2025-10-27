const express = require('express');
const router = express?.Router();

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

// Get all users
router?.get('/', (req, res) => {
  try {
    const { role, status, page = 1, limit = 10 } = req?.query;
    
    let filteredUsers = [...mockUsers];
    
    // Filter by role
    if (role) {
      filteredUsers = filteredUsers?.filter(user => user?.role === role);
    }
    
    // Filter by status
    if (status) {
      filteredUsers = filteredUsers?.filter(user => user?.status === status);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = filteredUsers?.slice(startIndex, endIndex);
    
    res?.json({
      users: paginatedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredUsers?.length / limit),
        totalUsers: filteredUsers?.length,
        hasNext: endIndex < filteredUsers?.length,
        hasPrev: startIndex > 0
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res?.status(500)?.json({ 
      error: 'Erro ao buscar usuários' 
    });
  }
});

// Get user by ID
router?.get('/:id', (req, res) => {
  try {
    const { id } = req?.params;
    const user = mockUsers?.find(u => u?.id === parseInt(id));
    
    if (!user) {
      return res?.status(404)?.json({ 
        error: 'Usuário não encontrado' 
      });
    }
    
    res?.json({ user });
    
  } catch (error) {
    console.error('Get user error:', error);
    res?.status(500)?.json({ 
      error: 'Erro ao buscar usuário' 
    });
  }
});

// Update user
router?.put('/:id', (req, res) => {
  try {
    const { id } = req?.params;
    const { name, email, status } = req?.body;
    
    const userIndex = mockUsers?.findIndex(u => u?.id === parseInt(id));
    
    if (userIndex === -1) {
      return res?.status(404)?.json({ 
        error: 'Usuário não encontrado' 
      });
    }
    
    // Update user data
    if (name) mockUsers[userIndex].name = name;
    if (email) mockUsers[userIndex].email = email;
    if (status) mockUsers[userIndex].status = status;
    
    res?.json({
      message: 'Usuário atualizado com sucesso',
      user: mockUsers?.[userIndex]
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res?.status(500)?.json({ 
      error: 'Erro ao atualizar usuário' 
    });
  }
});

// Delete user
router?.delete('/:id', (req, res) => {
  try {
    const { id } = req?.params;
    const userIndex = mockUsers?.findIndex(u => u?.id === parseInt(id));
    
    if (userIndex === -1) {
      return res?.status(404)?.json({ 
        error: 'Usuário não encontrado' 
      });
    }
    
    mockUsers?.splice(userIndex, 1);
    
    res?.json({
      message: 'Usuário removido com sucesso'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res?.status(500)?.json({ 
      error: 'Erro ao remover usuário' 
    });
  }
});

module.exports = router;