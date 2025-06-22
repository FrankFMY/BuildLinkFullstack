import express from 'express';
import { getUserProfile, updateMyProfile } from '../controllers/userController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Публичный профиль
router.get('/:id', getUserProfile);
// Редактирование своего профиля
router.put('/me', authMiddleware, updateMyProfile);

export default router;
