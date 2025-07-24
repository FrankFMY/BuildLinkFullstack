import express from 'express';
import {
    getAds,
    createAd,
    updateAd,
    deleteAd,
    getAdById,
} from '../controllers/adController';
import authMiddleware from '../middleware/authMiddleware';
import { uploadAdPhotos, deleteAdPhoto } from '../controllers/uploadController';

const router = express.Router();

router.route('/').get(getAds).post(authMiddleware, createAd);
router
    .route('/:id')
    .get(getAdById)
    .put(authMiddleware, updateAd)
    .delete(authMiddleware, deleteAd);

// Загрузка фото объявления
router.post('/:id/photos', authMiddleware, uploadAdPhotos);
// Удаление фото объявления
router.delete('/:id/photos/:photoKey', authMiddleware, deleteAdPhoto);

export default router;

