import express from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// 環境変数を読み込み
dotenv.config();

const router = express.Router();

// Docker環境用のデータベース接続設定
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'memorydb',
  user: process.env.DB_USER || 'devuser',
  password: process.env.DB_PASSWORD || 'devpass',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// 接続テスト
pool.on('connect', (client) => {
  console.log('✅ PostgreSQL（Docker）に接続しました - Client ID:', client.processID);
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL接続エラー:', err.message);
});

// 接続確認関数
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('🔍 データベース接続テスト中...');
    const result = await client.query('SELECT NOW(), current_database(), current_user');
    console.log('✅ 接続成功:', {
      time: result.rows[0].now,
      database: result.rows[0].current_database,
      user: result.rows[0].current_user
    });
    client.release();
    return true;
  } catch (error) {
    console.error('❌ データベース接続テスト失敗:', error);
    return false;
  }
};

// 初回接続テスト
testConnection();

// JWT秘密鍵
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const SALT_ROUNDS = 10;

// POST /auth/register - アカウント登録
router.post('/register', async (req, res) => {
  console.log('🔥 アカウント登録リクエスト受信:', { 
    body: { ...req.body, password: '[HIDDEN]' } 
  });
  
  const { username, email, password, bio } = req.body;

  // バリデーション
  if (!username || !email || !password) {
    console.log('❌ バリデーションエラー: 必須項目不足');
    return res.status(400).json({ 
      error: 'username, email, password are required',
      message: 'ユーザー名、メールアドレス、パスワードは必須です'
    });
  }

  if (password.length < 6) {
    console.log('❌ バリデーションエラー: パスワードが短すぎる');
    return res.status(400).json({ 
      error: 'Password too short',
      message: 'パスワードは6文字以上である必要があります'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('❌ バリデーションエラー: メールアドレス形式が無効');
    return res.status(400).json({ 
      error: 'Invalid email format',
      message: '正しいメールアドレス形式で入力してください'
    });
  }

  try {
    console.log('🔍 既存ユーザーチェック中...');
    
    // 既存ユーザーチェック
    const existingUser = await pool.query(
      'SELECT id FROM accounts WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ ユーザーが既に存在します');
      return res.status(409).json({ 
        error: 'User already exists',
        message: 'このユーザー名またはメールアドレスは既に使用されています'
      });
    }

    console.log('🔒 パスワードハッシュ化中...');
    
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    console.log('💾 データベースに保存中...');
    
    // アカウント作成
    const result = await pool.query(
      `INSERT INTO accounts (username, email, password_hash, bio, is_verified, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING id, username, email, bio, is_verified, created_at`,
      [username, email, hashedPassword, bio || '', false]
    );

    const user = result.rows[0];
    console.log('✅ ユーザー作成成功:', { id: user.id, username: user.username });

    // JWTトークン生成
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('🎫 JWTトークン生成完了');

    res.status(201).json({
      success: true,
      message: 'アカウントが正常に作成されました',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        isVerified: user.is_verified,
        createdAt: user.created_at
      },
      token
    });

  } catch (err) {
    console.error('❌ アカウント登録エラー:', err);
    res.status(500).json({ 
      error: 'Database error',
      message: 'サーバーエラーが発生しました。しばらく後でお試しください。'
    });
  }
});

// POST /auth/login - ログイン
router.post('/login', async (req, res) => {
  console.log('🔑 ログインリクエスト受信:', { email: req.body.email });
  
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required',
      message: 'メールアドレスとパスワードは必須です'
    });
  }

  try {
    // ユーザー検索
    const result = await pool.query(
      'SELECT id, username, email, password_hash, bio, is_verified, created_at FROM accounts WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ ユーザーが見つかりません:', email);
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'メールアドレスまたはパスワードが正しくありません'
      });
    }

    const user = result.rows[0];

    // パスワード確認
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      console.log('❌ パスワードが無効です');
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'メールアドレスまたはパスワードが正しくありません'
      });
    }

    // 最終ログイン時刻を更新
    await pool.query(
      'UPDATE accounts SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // JWTトークン生成
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('✅ ログイン成功:', { id: user.id, username: user.username });

    res.json({
      success: true,
      message: 'ログインに成功しました',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        isVerified: user.is_verified,
        createdAt: user.created_at
      },
      token
    });

  } catch (err) {
    console.error('❌ ログインエラー:', err);
    res.status(500).json({ 
      error: 'Database error',
      message: 'サーバーエラーが発生しました。しばらく後でお試しください。'
    });
  }
});

// JWT認証ミドルウェア
export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: '認証が必要です'
    });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: '無効なトークンです'
      });
    }
    req.user = user;
    next();
  });
};

// GET /auth/me - 現在のユーザー情報取得
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, bio, is_verified, avatar_url, created_at, last_login FROM accounts WHERE id = $1 AND is_active = true',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'ユーザーが見つかりません'
      });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        isVerified: user.is_verified,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (err) {
    console.error('❌ ユーザー情報取得エラー:', err);
    res.status(500).json({ 
      error: 'Database error',
      message: 'サーバーエラーが発生しました'
    });
  }
});

export default router;