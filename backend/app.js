import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: true, credentials: false }));
app.options('*', cors({ origin: true, credentials: false }));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MediConnect API is running',
    docs: '/api/health'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediConnect API running' });
});

app.use('/api', routes);
app.use('/', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
