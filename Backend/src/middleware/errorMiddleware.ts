import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Обработка ошибок валидации Mongoose
    if (err instanceof mongoose.Error.ValidationError) {
        res.status(400);
        res.json({
            message: Object.values(err.errors)
                .map((e) => e.message)
                .join('; '),
            type: 'ValidationError',
        });
        return;
    }
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export { notFound, errorHandler };

