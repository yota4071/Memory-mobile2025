import express from 'express';
import serverless from 'serverless-http';
import accountRoutes from './routes/account';

const app = express();

app.use(express.json()); // ✅ JSON受け取りOK
app.use('/api', accountRoutes); // ✅ account.tsのルーティングを `/api` にマウント

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export const handler = serverless(app); // ✅ Lambda対応