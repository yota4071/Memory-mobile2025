// src/index.ts
import express from 'express';
import serverless from 'serverless-http';
import accountRoutes from './routes/account';

const app = express();

// JSON リクエストをパース
app.use(express.json());

// API ルーティング
app.use('/api', accountRoutes);

// ヘルスチェック
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Lambda 用のハンドラーとしてエクスポート
export const handler = serverless(app);