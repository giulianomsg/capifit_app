const express = require('express');
const { query } = require('../lib/db');
const { buildWhereClause, buildOrderByClause, buildLimitClause } = require('../lib/query-builder');
const parseQueryOptions = require('../middleware/parseQueryOptions');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function sanitizeNotification(record) {
  return {
    id: record.id,
    user_id: record.user_id,
    title: record.title,
    message: record.message,
    category: record.category,
    priority: record.priority,
    is_read: !!record.is_read,
    action_url: record.action_url,
    metadata: typeof record.metadata === 'string' ? JSON.parse(record.metadata || '{}') : record.metadata,
    created_at: record.created_at,
  };
}

router.use(authMiddleware);

router.get('/', parseQueryOptions, async (req, res) => {
  try {
    const baseWhere = { user_id: req.user?.id };
    if (req.query.user_id) {
      baseWhere.user_id = req.query.user_id;
    }

    const limitValue = Number.isFinite(req.queryOptions.limit) ? Number(req.queryOptions.limit) : undefined;
    const offsetValue = Number.isFinite(req.queryOptions.offset) ? Number(req.queryOptions.offset) : undefined;

    const values = [];
    const whereClause = buildWhereClause({ ...baseWhere, ...req.queryOptions.where }, values);
    const orderClause = buildOrderByClause(req.queryOptions.orderBy || { created_at: 'desc' });
    const limitClause = buildLimitClause(limitValue, offsetValue);
    const filters = whereClause ? `WHERE ${whereClause}` : '';

    const listSql = `
      SELECT * FROM notifications
      ${filters}
      ${orderClause}
      ${limitClause}
    `;
    const countSql = `SELECT COUNT(*) as total FROM notifications ${filters}`;

    const [listResult, countResult] = await Promise.all([
      query(listSql, values),
      query(countSql, values),
    ]);

    const notifications = (listResult?.[0] || []).map(sanitizeNotification);
    const totalRow = Array.isArray(countResult?.[0]) ? countResult[0][0] : countResult?.[0];
    const total = totalRow?.total ? Number(totalRow.total) : 0;

    res.json({
      notifications,
      pagination: {
        total,
        limit: typeof limitValue === 'number' ? limitValue : notifications.length,
        offset: typeof offsetValue === 'number' ? offsetValue : 0,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Erro ao buscar notificações' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, title, message, category, priority = 'medium', action_url, metadata } = req.body || {};

    if (!user_id || !title || !message) {
      return res.status(400).json({ message: 'Usuário, título e mensagem são obrigatórios' });
    }

    const insertSql = `
      INSERT INTO notifications (id, user_id, title, message, category, priority, action_url, metadata)
      VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
    `;

    await query(insertSql, [
      user_id,
      title,
      message,
      category || null,
      priority,
      action_url || null,
      metadata ? JSON.stringify(metadata) : null,
    ]);

    const [rows] = await query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [user_id]
    );

    res.status(201).json({ notification: sanitizeNotification(rows?.[0]) });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Erro ao criar notificação' });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const [result] = await query('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0 && result.rowCount === 0) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }

    res.json({ message: 'Notificação marcada como lida' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Erro ao atualizar notificação' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await query('DELETE FROM notifications WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0 && result.rowCount === 0) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }

    res.json({ message: 'Notificação removida com sucesso' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Erro ao remover notificação' });
  }
});

module.exports = router;
