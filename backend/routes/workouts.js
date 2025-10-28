const express = require('express');

const router = express.Router();

// Mock data for workouts (replace with database queries)
const mockWorkouts = [
  {
    id: 1,
    name: 'Treino de Peito e Tríceps',
    description: 'Treino focado em peitorais e tríceps',
    trainer_id: 2,
    client_id: 1,
    exercises: [
      { name: 'Supino Reto', sets: 4, reps: '8-12', weight: '70kg' },
      { name: 'Supino Inclinado', sets: 3, reps: '10-12', weight: '60kg' },
      { name: 'Tríceps Testa', sets: 3, reps: '12-15', weight: '30kg' }
    ],
    status: 'active',
    created_at: '2024-10-25'
  },
  {
    id: 2,
    name: 'Treino de Costas e Bíceps',
    description: 'Treino focado em dorsais e bíceps',
    trainer_id: 2,
    client_id: 1,
    exercises: [
      { name: 'Puxada Frontal', sets: 4, reps: '8-10', weight: '50kg' },
      { name: 'Remada Curvada', sets: 3, reps: '10-12', weight: '40kg' },
      { name: 'Rosca Direta', sets: 3, reps: '12-15', weight: '15kg' }
    ],
    status: 'active',
    created_at: '2024-10-24'
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

// Get all workouts
router.get('/', (req, res) => {
  try {
    const { client_id, trainer_id, status, page = 1, limit = 10, where, orderBy } = req.query;

    let filteredWorkouts = [...mockWorkouts];

    const parsedWhere = parseJSONParam(where);
    const parsedOrder = parseJSONParam(orderBy);

    if (parsedWhere) {
      filteredWorkouts = filteredWorkouts.filter((workout) => matchesFilters(workout, parsedWhere));
    }

    if (client_id) {
      filteredWorkouts = filteredWorkouts.filter((workout) => workout?.client_id === parseInt(client_id, 10));
    }

    if (trainer_id) {
      filteredWorkouts = filteredWorkouts.filter((workout) => workout?.trainer_id === parseInt(trainer_id, 10));
    }

    if (status) {
      filteredWorkouts = filteredWorkouts.filter((workout) => workout?.status === status);
    }

    if (parsedOrder && parsedOrder?.created_at) {
      const direction = String(parsedOrder.created_at).toLowerCase() === 'asc' ? 1 : -1;
      filteredWorkouts.sort((a, b) => a.created_at.localeCompare(b.created_at) * direction);
    }

    const numericLimit = Number(limit) || 10;
    const numericPage = Number(page) || 1;
    const startIndex = (numericPage - 1) * numericLimit;
    const endIndex = startIndex + numericLimit;
    const paginatedWorkouts = filteredWorkouts.slice(startIndex, endIndex);

    res.json({
      workouts: paginatedWorkouts,
      pagination: {
        currentPage: numericPage,
        totalPages: Math.ceil(filteredWorkouts.length / numericLimit) || 1,
        totalWorkouts: filteredWorkouts.length,
        hasNext: endIndex < filteredWorkouts.length,
        hasPrev: startIndex > 0,
      },
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({
      error: 'Erro ao buscar treinos',
    });
  }
});

// Get workout by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const workout = mockWorkouts.find((w) => w?.id === parseInt(id, 10));

    if (!workout) {
      return res.status(404).json({
        error: 'Treino não encontrado',
      });
    }

    res.json({ workout });

  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({
      error: 'Erro ao buscar treino',
    });
  }
});

// Create new workout
router.post('/', (req, res) => {
  try {
    const { name, description, trainer_id, client_id, exercises } = req.body;

    if (!name || !trainer_id || !client_id) {
      return res.status(400).json({
        error: 'Nome, ID do treinador e ID do cliente são obrigatórios',
      });
    }

    const newWorkout = {
      id: mockWorkouts.length + 1,
      name,
      description: description || '',
      trainer_id: parseInt(trainer_id, 10),
      client_id: parseInt(client_id, 10),
      exercises: exercises || [],
      status: 'active',
      created_at: new Date().toISOString().split('T')?.[0],
    };

    mockWorkouts.push(newWorkout);

    res.status(201).json({
      message: 'Treino criado com sucesso',
      workout: newWorkout,
    });

  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({
      error: 'Erro ao criar treino',
    });
  }
});

// Update workout
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, exercises, status } = req.body;

    const workoutIndex = mockWorkouts.findIndex((w) => w?.id === parseInt(id, 10));

    if (workoutIndex === -1) {
      return res.status(404).json({
        error: 'Treino não encontrado',
      });
    }

    // Update workout data
    if (name) mockWorkouts[workoutIndex].name = name;
    if (description) mockWorkouts[workoutIndex].description = description;
    if (exercises) mockWorkouts[workoutIndex].exercises = exercises;
    if (status) mockWorkouts[workoutIndex].status = status;

    res.json({
      message: 'Treino atualizado com sucesso',
      workout: mockWorkouts?.[workoutIndex],
    });

  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({
      error: 'Erro ao atualizar treino',
    });
  }
});

// Delete workout
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const workoutIndex = mockWorkouts.findIndex((w) => w?.id === parseInt(id, 10));

    if (workoutIndex === -1) {
      return res.status(404).json({
        error: 'Treino não encontrado',
      });
    }

    mockWorkouts.splice(workoutIndex, 1);

    res.json({
      message: 'Treino removido com sucesso',
    });

  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({
      error: 'Erro ao remover treino',
    });
  }
});

module.exports = router;