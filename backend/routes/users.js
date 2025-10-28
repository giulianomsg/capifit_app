const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../lib/db');
const { buildWhereClause, buildOrderByClause, buildLimitClause } = require('../lib/query-builder');
const parseQueryOptions = require('../middleware/parseQueryOptions');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function sanitizeUser(record) {
  return {
    id: record.id,
    email: record.email,
    full_name: record.full_name,
    name: record.full_name,
    role: record.role,
    phone: record.phone,
    status: record.is_active ? 'active' : 'inactive',
    is_active: record.is_active,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

async function buildUsersQuery(baseWhere, queryOptions) {
  const values = [];
  const whereClause = buildWhereClause({ ...baseWhere, ...queryOptions.where }, values);
  const orderClause = buildOrderByClause(queryOptions.orderBy);
  const limitClause = buildLimitClause(queryOptions.limit, queryOptions.offset);

  const filters = whereClause ? `WHERE ${whereClause}` : '';
  const sql = `
    SELECT id, email, full_name, role, phone, is_active, created_at, updated_at
    FROM users
    ${filters}
    ${orderClause}
    ${limitClause}
  `;

  const countSql = `SELECT COUNT(*) as total FROM users ${filters}`;

  return { sql, countSql, values };
}

router.use(authMiddleware);

router.get('/', parseQueryOptions, async (req, res) => {
  try {
    const baseWhere = {};
    if (req.query.role) {
      baseWhere.role = req.query.role;
    }
    if (req.query.status) {
      baseWhere.is_active = req.query.status === 'active';
    }

    const limitValue = Number.isFinite(req.queryOptions.limit) ? Number(req.queryOptions.limit) : undefined;
    const offsetValue = Number.isFinite(req.queryOptions.offset) ? Number(req.queryOptions.offset) : undefined;

    const options = {
      where: req.queryOptions.where,
      orderBy: Object.keys(req.queryOptions.orderBy).length ? req.queryOptions.orderBy : { created_at: 'desc' },
      limit: limitValue,
      offset: offsetValue,
    };

    const { sql, countSql, values } = await buildUsersQuery(baseWhere, options);

    const [userResult, countResult] = await Promise.all([
      query(sql, values),
      query(countSql, values),
    ]);

    const rows = userResult?.[0] || [];
    const countRows = countResult?.[0] || [];
    const users = rows.map(sanitizeUser);
    const total = countRows?.[0]?.total || 0;
    const limit = typeof limitValue === 'number' ? limitValue : users.length;
    const offset = typeof offsetValue === 'number' ? offsetValue : 0;

    res.json({
      users,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [req.params.id]);
    const user = rows?.[0];

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { email, full_name, role = 'client', phone, password, is_active = true } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const normalizedEmail = email.toLowerCase();
    const [existing] = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);

    if (existing?.length) {
      return res.status(409).json({ message: 'Já existe um usuário com este email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await query(
      `INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
      [normalizedEmail, passwordHash, role, full_name || '', phone || null, is_active ? 1 : 0]
    );

    const [createdRows] = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    res.status(201).json({ user: sanitizeUser(createdRows?.[0]) });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { full_name, role, phone, status, is_active } = req.body || {};
    const updates = [];
    const values = [];

    if (full_name !== undefined) {
      updates.push('full_name = ?');
      values.push(full_name);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (status !== undefined || is_active !== undefined) {
      const normalizedStatus = status !== undefined ? status === 'active' : !!is_active;
      updates.push('is_active = ?');
      values.push(normalizedStatus ? 1 : 0);
    }

    if (!updates.length) {
      return res.status(400).json({ message: 'Nenhuma alteração fornecida' });
    }

    values.push(req.params.id);

    const [result] = await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0 && result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const [rows] = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [req.params.id]);
    res.json({ user: sanitizeUser(rows?.[0]) });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await query('DELETE FROM users WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0 && result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Erro ao remover usuário' });
  }
});

module.exports = router;
