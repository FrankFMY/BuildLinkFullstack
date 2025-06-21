import express from 'express';
import {
    getAds,
    createAd,
    updateAd,
    deleteAd,
} from '../controllers/adController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(getAds).post(authMiddleware, createAd);
router
    .route('/:id')
    .put(authMiddleware, updateAd)
    .delete(authMiddleware, deleteAd);

export default router;
