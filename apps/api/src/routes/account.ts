import express from 'express';
import { Pool } from 'pg';

const router = express.Router();
const pool = new Pool(); // .env からDB接続設定読み込み

// POST /accounts - アカウント登録
router.post('/accounts', async (req, res) => {
    console.log('受信したリクエストボディ:', req.body);
  const { username,bio } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'username is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO accounts (username, bio) VALUES ($1, $2) RETURNING *',
      [username, bio]
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
    const result = await pool.query(
      'SELECT * FROM accounts ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;