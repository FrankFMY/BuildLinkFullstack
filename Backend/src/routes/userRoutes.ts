import express from 'express';
import { getUserProfile, updateMyProfile } from '../controllers/userController';
import authMiddleware from '../middleware/authMiddleware';
import { uploadAvatar, deleteAvatar } from '../controllers/uploadController';

const router = express.Router();

// Публичный профиль
router.get('/:id', getUserProfile);
// Редактирование своего профиля
router.put('/me', authMiddleware, updateMyProfile);
// Загрузка аватара
router.post('/me/avatar', authMiddleware, uploadAvatar);
// Удаление аватара
router.delete('/me/avatar', authMiddleware, deleteAvatar);

export default router;

