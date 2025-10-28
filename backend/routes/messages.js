const express = require('express');
const { query } = require('../lib/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function sanitizeMessage(record) {
  return {
    id: record.id,
    sender_id: record.sender_id,
    receiver_id: record.receiver_id,
    content: record.content,
    message_type: record.message_type,
    file_url: record.file_url,
    is_read: !!record.is_read,
    created_at: record.created_at,
  };
}

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id || req.user?.id;
    const contactId = req.query.contact_id;

    if (!userId) {
      return res.status(400).json({ message: 'user_id é obrigatório' });
    }

    let sql = `
      SELECT * FROM messages
      WHERE sender_id = ? OR receiver_id = ?
      ORDER BY created_at DESC
      LIMIT 200
    `;
    const params = [userId, userId];

    if (contactId) {
      sql = `
        SELECT * FROM messages
        WHERE (sender_id = ? AND receiver_id = ?)
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at ASC
        LIMIT 500
      `;
      params.splice(0, params.length, userId, contactId, contactId, userId);
    }

    const [rows] = await query(sql, params);
    const messages = (rows || []).map(sanitizeMessage);

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Erro ao buscar mensagens' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { sender_id, receiver_id, content, message_type = 'text', file_url } = req.body || {};

    if (!sender_id || !receiver_id || !content) {
      return res.status(400).json({ message: 'Remetente, destinatário e conteúdo são obrigatórios' });
    }

    const insertSql = `
      INSERT INTO messages (id, sender_id, receiver_id, content, message_type, file_url)
      VALUES (UUID(), ?, ?, ?, ?, ?)
    `;

    await query(insertSql, [sender_id, receiver_id, content, message_type, file_url || null]);

    const [rows] = await query(
      `SELECT * FROM messages WHERE sender_id = ? AND receiver_id = ? ORDER BY created_at DESC LIMIT 1`,
      [sender_id, receiver_id]
    );

    res.status(201).json({ message: sanitizeMessage(rows?.[0]) });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ message: 'Erro ao enviar mensagem' });
  }
});

router.post('/:id/read', async (req, res) => {
  try {
    const [result] = await query('UPDATE messages SET is_read = 1 WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0 && result.rowCount === 0) {
      return res.status(404).json({ message: 'Mensagem não encontrada' });
    }

    res.json({ message: 'Mensagem marcada como lida' });
  } catch (error) {
    console.error('Read message error:', error);
    res.status(500).json({ message: 'Erro ao atualizar mensagem' });
  }
});

module.exports = router;
