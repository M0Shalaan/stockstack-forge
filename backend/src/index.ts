import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from './config';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import warehouseRoutes from './routes/warehouses';
import categoryRoutes from './routes/categories';
import partyRoutes from './routes/parties';
import transactionRoutes from './routes/transactions';

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.corsOrigins.includes('*') || config.corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/transactions', transactionRoutes);

// error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

mongoose
  .connect(config.mongoUri!)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(config.port, () => {
      console.log(`API listening on :${config.port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });
