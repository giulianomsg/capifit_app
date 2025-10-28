import express from 'express';
import morgan from 'morgan';
import v1Routes from './routes/v1';
import { StatusCodes } from 'http-status-codes';
import { mockAuth } from './middleware/mockAuth';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(mockAuth);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1', v1Routes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
});

export default app;
