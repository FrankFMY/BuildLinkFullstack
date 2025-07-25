import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import { AuthRequest } from '../types';
import { sanitizeString } from '../utils/validation';

// Получить публичный профиль пользователя
export const getUserProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const user = await User.findById(req.params.id).select(
            '-password -role'
        );
        if (!user) {
            res.status(404);
            throw new Error('Пользователь не найден');
        }
        // Возвращаем публичные поля включая email и phone
        const publicFields = [
            '_id',
            'username',
            'email',
            'phone',
            'firstName',
            'lastName',
            'middleName',
            'city',
            'age',
            'timezone',
            'avatar',
        ];
        const userObj = user.toObject() as unknown as Record<string, unknown>;
        const result: Record<string, unknown> = {};
        publicFields.forEach((f) => {
            if (userObj[f] !== undefined) result[f] = userObj[f];
        });
        res.json(result);
    }
);

// Обновить свой профиль
export const updateMyProfile = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        const user = await User.findById(req.user?.id);
        if (!user) {
            res.status(404);
            throw new Error('Пользователь не найден');
        }
        // Запрещаем менять email, username, role
        if (
            'email' in req.body ||
            'username' in req.body ||
            'role' in req.body
        ) {
            res.status(400);
            throw new Error('Изменение email, username или role запрещено');
        }
        const fields = [
            'firstName',
            'lastName',
            'middleName',
            'city',
            'age',
            'timezone',
            'avatar',
            'phone',
        ];
        for (const field of fields) {
            if (req.body[field] !== undefined) {
                let value = req.body[field];
                // XSS-фильтрация для строк
                if (typeof value === 'string') {
                    value = sanitizeString(value);
                }
                // Валидация длины
                if (typeof value === 'string') {
                    const maxLen = {
                        firstName: 32,
                        lastName: 32,
                        middleName: 32,
                        city: 64,
                        timezone: 64,
                        avatar: 256,
                    }[field];
                    if (maxLen && value.length > maxLen) {
                        res.status(400);
                        throw new Error(`Поле ${field} слишком длинное`);
                    }
                }
                // Валидация возраста
                if (field === 'age' && (value < 0 || value > 120)) {
                    res.status(400);
                    throw new Error('Некорректный возраст');
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (user as any)[field] = value;
            }
        }
        await user.save();
        res.json({ message: 'Профиль обновлён', user });
    }
);

