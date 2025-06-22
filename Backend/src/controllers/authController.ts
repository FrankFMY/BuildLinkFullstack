import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import { AuthRequest } from '../types';
import {
    isValidEmail,
    isValidUsername,
    isValidPhone,
    sanitizeString,
} from '../utils/validation';
import { generateToken } from '../utils/jwt';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(
    async (req: Request, res: Response) => {
        let { username, email, phone } = req.body;
        const { password } = req.body;
        username = sanitizeString(username);
        email = sanitizeString(email);
        phone = sanitizeString(phone);

        if (!isValidEmail(email)) {
            res.status(400);
            throw new Error('Некорректный email');
        }
        if (!isValidUsername(username)) {
            res.status(400);
            throw new Error('Некорректный username');
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
            res.status(400);
            throw new Error('Некорректный password');
        }
        if (!isValidPhone(phone)) {
            res.status(400);
            throw new Error('Некорректный телефон');
        }

        const userExists = await User.findOne({ $or: [{ email }, { phone }] });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            username,
            email,
            password,
            phone,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                token: generateToken(user.id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    }
);

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;

    // Find user by either email or username
    const user = await User.findOne({
        $or: [{ email: username }, { username: username }],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            access_token: generateToken(user.id), // Match FastAPI response for frontend
            token_type: 'bearer',
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    // req.user is attached by authMiddleware
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json(user);
});

