import express from 'express';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok (local)' });
});

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Local Express!' });
});

app.listen(3001, () => {
  console.log('🚀 Local server running at http://localhost:3001');
});