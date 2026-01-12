import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from'cors';
import authRoutes from '#routes/auth.routes.js';


const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(morgan('combined', { stream: {write: (message)=> logger.info(message.trim())} }));

app.get('/', (req, res) => {
  logger.info('hello from Acquisitions');
  res.status(200).send('hello from aquisitions');
});

app.get('/health',(req,res)=>{
  res.status(200).json({status:'ok', timestamp: new Date().toISOString(), uptime:process.uptime()});
});
app.get('/api',(req,res)=>{
  res.status(200).json({message: 'Aquisition API is running'});
});

app.use('/api/auth', authRoutes);

export default app;
