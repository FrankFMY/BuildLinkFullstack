import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import adRoutes from './routes/adRoutes';
import userRoutes from './routes/userRoutes';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import swaggerUi from 'swagger-ui-express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerSpec = require('./swagger.js');
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

// Connect to DB only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

const app = express();

app.use(helmet());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
    })
);
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/users', userRoutes);

// It's good practice to have error handling middleware
// If you don't have them, I can add them.
app.use(notFound);
app.use(errorHandler);

export default app;
