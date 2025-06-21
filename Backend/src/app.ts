import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import adRoutes from './routes/adRoutes';
import { errorHandler, notFound } from './middleware/errorMiddleware';

dotenv.config();

// Connect to DB only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/ads', adRoutes);

// It's good practice to have error handling middleware
// If you don't have them, I can add them.
app.use(notFound);
app.use(errorHandler);

export default app;
