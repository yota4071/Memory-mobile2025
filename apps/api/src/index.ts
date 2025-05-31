// src/index.ts
import express from 'express';
import serverless from 'serverless-http';

const app = express();

// JSONリクエストを扱えるようにする
app.use(express.json());

// ヘルスチェック用のエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 他にもエンドポイントを追加できます
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Lambda + Express!' });
});

// Lambda 用にエクスポート
export const handler = serverless(app);