import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

// 環境変数を読み込み
dotenv.config();

const app = express();

// CORS設定
app.use(cors({
  origin: [
    'exp://192.168.1.100:8081', // Expo Go アプリ
    'http://localhost:3000',     // Web開発環境
    'http://localhost:8081',     // Expo Web
    /^exp:\/\/192\.168\.\d+\.\d+:8081$/, // 動的IPアドレス対応
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// JSONパーサー設定
app.use(express.json({ limit: '10mb' }));

// ルーティング（auth のみ）
app.use('/api/auth', authRoutes);

// ヘルスチェック
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404ハンドラー
app.use('*', (_req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: '指定されたエンドポイントが見つかりません'
  });
});

// エラーハンドラー
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('サーバーエラー:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'サーバー内部エラーが発生しました'
  });
});

export const handler = serverless(app);