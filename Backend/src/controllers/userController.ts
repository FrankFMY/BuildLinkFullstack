import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import { AuthRequest } from '../types';

// Получить публичный профиль пользователя
export const getUserProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const user = await User.findById(req.params.id).select(
            '-password -email'
        );
        if (!user) {
            res.status(404);
            throw new Error('Пользователь не найден');
        }
        res.json(user);
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
        const fields = [
            'firstName',
            'lastName',
            'middleName',
            'city',
            'age',
            'timezone',
            'avatar',
        ];
        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                (user as any)[field] = req.body[field];
            }
        });
        await user.save();
        res.json({ message: 'Профиль обновлён', user });
    }
);
