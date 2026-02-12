import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Express API' });
});

app.post('/api/echo', (req, res) => {
  const { message } = req.body;
  res.json({ echo: message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});