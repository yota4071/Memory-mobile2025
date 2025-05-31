// apps/api/src/routes/account.ts
import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

// PostgreSQL接続（.env に依存）
const pool = new Pool(); // 自動で.envから読み込み

// POST /accounts - アカウント登録
router.post('/example', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'username is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO example (username) VALUES ($1) RETURNING *',
      [username]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /accounts - アカウント一覧取得
router.get('/accounts', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM example ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;