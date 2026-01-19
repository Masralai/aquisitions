import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from '#routes/auth.routes.js';
import userRoutes from '#routes/users.routes.js';
import securityMiddleware from '#middleware/security.middleware.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);
app.use(securityMiddleware);

app.get('/', (req, res) => {
  logger.info('hello from Acquisitions');
  res.status(200).send('hello from aquisitions');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Aquisition API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
console.log('NODE_ENV =', process.env.NODE_ENV);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
