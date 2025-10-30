import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import integrationsRoutes from './routes/integrations.js';
import conversationsRoutes from './routes/conversations.js';
import chatRoutes from './routes/chat.js';
import googleCallbackRoutes from './routes/googleCallback.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

initDatabase();

app.use('/api/auth', authRoutes);
app.use('/api', integrationsRoutes);
app.use('/api', conversationsRoutes);
app.use('/api', chatRoutes);
app.use(googleCallbackRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
