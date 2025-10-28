const express = require('express');
const { query } = require('../lib/db');
const { buildWhereClause, buildOrderByClause, buildLimitClause } = require('../lib/query-builder');
const parseQueryOptions = require('../middleware/parseQueryOptions');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function sanitizeClient(record) {
  return {
    id: record.id,
    trainer_id: record.trainer_id,
    name: record.name,
    email: record.email,
    phone: record.phone,
    birth_date: record.birth_date,
    emergency_contact: record.emergency_contact,
    medical_conditions: record.medical_conditions,
    goals: record.goals,
    subscription_status: record.subscription_status,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

router.use(authMiddleware);

router.get('/', parseQueryOptions, async (req, res) => {
  try {
    const baseWhere = {};
    if (req.query.trainer_id) {
      baseWhere.trainer_id = req.query.trainer_id;
    }

    const limitValue = Number.isFinite(req.queryOptions.limit) ? Number(req.queryOptions.limit) : undefined;
    const offsetValue = Number.isFinite(req.queryOptions.offset) ? Number(req.queryOptions.offset) : undefined;

    const values = [];
    const whereClause = buildWhereClause({ ...baseWhere, ...req.queryOptions.where }, values);
    const orderClause = buildOrderByClause(req.queryOptions.orderBy || { created_at: 'desc' });
    const limitClause = buildLimitClause(limitValue, offsetValue);

    const filters = whereClause ? `WHERE ${whereClause}` : '';

    const listSql = `
      SELECT * FROM clients
      ${filters}
      ${orderClause}
      ${limitClause}
    `;
    const countSql = `SELECT COUNT(*) as total FROM clients ${filters}`;

    const [listResult, countResult] = await Promise.all([
      query(listSql, values),
      query(countSql, values),
    ]);

    const clients = (listResult?.[0] || []).map(sanitizeClient);
    const totalRow = Array.isArray(countResult?.[0]) ? countResult[0][0] : countResult?.[0];
    const total = totalRow?.total ? Number(totalRow.total) : 0;

    res.json({
      clients,
      pagination: {
        total,
        limit: typeof limitValue === 'number' ? limitValue : clients.length,
        offset: typeof offsetValue === 'number' ? offsetValue : 0,
      },
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Erro ao buscar clientes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM clients WHERE id = ? LIMIT 1', [req.params.id]);
    const client = rows?.[0];

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json({ client: sanitizeClient(client) });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ message: 'Erro ao buscar cliente' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      trainer_id,
      name,
      email,
      phone,
      birth_date,
      emergency_contact,
      medical_conditions,
      goals,
      subscription_status = 'active',
    } = req.body || {};

    if (!trainer_id || !name) {
      return res.status(400).json({ message: 'Treinador e nome são obrigatórios' });
    }

    const insertSql = `
      INSERT INTO clients (
        id, trainer_id, name, email, phone, birth_date, emergency_contact,
        medical_conditions, goals, subscription_status
      ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await query(insertSql, [
      trainer_id,
      name,
      email || null,
      phone || null,
      birth_date || null,
      emergency_contact || null,
      medical_conditions || null,
      goals || null,
      subscription_status,
    ]);

    const [rows] = await query(
      `SELECT * FROM clients WHERE trainer_id = ? ORDER BY created_at DESC LIMIT 1`,
      [trainer_id]
    );

    res.status(201).json({ client: sanitizeClient(rows?.[0]) });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Erro ao criar cliente' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      birth_date,
      emergency_contact,
      medical_conditions,
      goals,
      subscription_status,
    } = req.body || {};

    const updates = [];
    const values = [];

    const fields = {
      name,
      email,
      phone,
      birth_date,
      emergency_contact,
      medical_conditions,
      goals,
      subscription_status,
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (!updates.length) {
      return res.status(400).json({ message: 'Nenhuma alteração fornecida' });
    }

    values.push(req.params.id);

    const [result] = await query(`UPDATE clients SET ${updates.join(', ')} WHERE id = ?`, values);

    if (result.affectedRows === 0 && result.rowCount === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const [rows] = await query('SELECT * FROM clients WHERE id = ? LIMIT 1', [req.params.id]);
    res.json({ client: sanitizeClient(rows?.[0]) });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Erro ao atualizar cliente' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await query('DELETE FROM clients WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0 && result.rowCount === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Erro ao remover cliente' });
  }
});

module.exports = router;
