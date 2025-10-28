const express = require('express');
const { query } = require('../lib/db');
const { buildWhereClause, buildOrderByClause, buildLimitClause } = require('../lib/query-builder');
const parseQueryOptions = require('../middleware/parseQueryOptions');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function sanitizeWorkout(record) {
  return {
    id: record.id,
    trainer_id: record.trainer_id,
    client_id: record.client_id,
    name: record.name,
    description: record.description,
    exercises: record.exercises ? JSON.parse(record.exercises) : [],
    scheduled_date: record.scheduled_date,
    completed_at: record.completed_at,
    status: record.status,
    notes: record.notes,
    created_at: record.created_at,
  };
}

router.use(authMiddleware);

router.get('/', parseQueryOptions, async (req, res) => {
  try {
    const baseWhere = {};
    if (req.query.client_id) {
      baseWhere.client_id = req.query.client_id;
    }
    if (req.query.trainer_id) {
      baseWhere.trainer_id = req.query.trainer_id;
    }
    if (req.query.status) {
      baseWhere.status = req.query.status;
    }

    const limitValue = Number.isFinite(req.queryOptions.limit) ? Number(req.queryOptions.limit) : undefined;
    const offsetValue = Number.isFinite(req.queryOptions.offset) ? Number(req.queryOptions.offset) : undefined;

    const options = {
      where: req.queryOptions.where,
      orderBy: Object.keys(req.queryOptions.orderBy).length ? req.queryOptions.orderBy : { created_at: 'desc' },
      limit: limitValue,
      offset: offsetValue,
    };

    const values = [];
    const whereClause = buildWhereClause({ ...baseWhere, ...options.where }, values);
    const orderClause = buildOrderByClause(options.orderBy);
    const limitClause = buildLimitClause(options.limit, options.offset);

    const filters = whereClause ? `WHERE ${whereClause}` : '';

    const listSql = `
      SELECT id, trainer_id, client_id, name, description, exercises, scheduled_date,
             completed_at, status, notes, created_at
      FROM workouts
      ${filters}
      ${orderClause}
      ${limitClause}
    `;

    const countSql = `SELECT COUNT(*) as total FROM workouts ${filters}`;

    const [listResult, countResult] = await Promise.all([
      query(listSql, values),
      query(countSql, values),
    ]);

    const rows = listResult?.[0] || [];
    const countRows = countResult?.[0] || [];
    const workouts = rows.map(sanitizeWorkout);
    const total = countRows?.[0]?.total || 0;

    res.json({
      workouts,
      pagination: {
        total,
        limit: typeof limitValue === 'number' ? limitValue : workouts.length,
        offset: typeof offsetValue === 'number' ? offsetValue : 0,
      },
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Erro ao buscar treinos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM workouts WHERE id = ? LIMIT 1', [req.params.id]);
    const workout = rows?.[0];

    if (!workout) {
      return res.status(404).json({ message: 'Treino não encontrado' });
    }

    res.json({ workout: sanitizeWorkout(workout) });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ message: 'Erro ao buscar treino' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { trainer_id, client_id, name, description, exercises, scheduled_date, status = 'scheduled', notes } = req.body || {};

    if (!trainer_id || !client_id || !name) {
      return res.status(400).json({ message: 'Treinador, cliente e nome são obrigatórios' });
    }

    const payload = {
      trainer_id,
      client_id,
      name,
      description: description || '',
      exercises: JSON.stringify(exercises || []),
      scheduled_date: scheduled_date || null,
      status,
      notes: notes || null,
    };

    const insertSql = `
      INSERT INTO workouts (id, trainer_id, client_id, name, description, exercises, scheduled_date, status, notes)
      VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await query(insertSql, [
      payload.trainer_id,
      payload.client_id,
      payload.name,
      payload.description,
      payload.exercises,
      payload.scheduled_date,
      payload.status,
      payload.notes,
    ]);

    const [createdRows] = await query(
      `SELECT * FROM workouts WHERE trainer_id = ? AND client_id = ? ORDER BY created_at DESC LIMIT 1`,
      [payload.trainer_id, payload.client_id]
    );

    res.status(201).json({ workout: sanitizeWorkout(createdRows?.[0]) });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ message: 'Erro ao criar treino' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, exercises, status, scheduled_date, completed_at, notes } = req.body || {};
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (exercises !== undefined) {
      updates.push('exercises = ?');
      values.push(JSON.stringify(exercises || []));
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (scheduled_date !== undefined) {
      updates.push('scheduled_date = ?');
      values.push(scheduled_date);
    }
    if (completed_at !== undefined) {
      updates.push('completed_at = ?');
      values.push(completed_at);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }

    if (!updates.length) {
      return res.status(400).json({ message: 'Nenhuma alteração fornecida' });
    }

    values.push(req.params.id);

    const [result] = await query(`UPDATE workouts SET ${updates.join(', ')} WHERE id = ?`, values);

    if (result.affectedRows === 0 && result.rowCount === 0) {
      return res.status(404).json({ message: 'Treino não encontrado' });
    }

    const [rows] = await query('SELECT * FROM workouts WHERE id = ? LIMIT 1', [req.params.id]);
    res.json({ workout: sanitizeWorkout(rows?.[0]) });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ message: 'Erro ao atualizar treino' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await query('DELETE FROM workouts WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0 && result.rowCount === 0) {
      return res.status(404).json({ message: 'Treino não encontrado' });
    }

    res.json({ message: 'Treino removido com sucesso' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Erro ao remover treino' });
  }
});

module.exports = router;
