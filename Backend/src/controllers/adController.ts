import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import Ad from '../models/Ad';
import { AuthRequest } from '../types';

// @desc    Get all ads
// @route   GET /api/ads
// @access  Public
export const getAds = asyncHandler(async (req: AuthRequest, res: Response) => {
    const ads = await Ad.find({}).populate('author', 'username email');
    res.json(
        ads.map((ad) => ({
            id: ad._id,
            title: ad.title,
            description: ad.description,
            price: ad.price,
            author: ad.author,
            createdAt: ad.createdAt,
        }))
    );
});

// @desc    Create a new ad
// @route   POST /api/ads
// @access  Private
export const createAd = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        const { title, description, price } = req.body;

        if (!title || !description) {
            res.status(400);
            throw new Error('Title and description are required');
        }

        const ad = new Ad({
            title,
            description,
            price: price || 0,
            author: req.user?.id,
        });

        const createdAd = await ad.save();
        res.status(201).json(createdAd);
    }
);

// @desc    Update an ad
// @route   PUT /api/ads/:id
// @access  Private
export const updateAd = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        const { title, description, price } = req.body;
        const adId = req.params.id;
        const userId = req.user?.id;

        const ad = await Ad.findById(adId);

        if (!ad) {
            res.status(404);
            throw new Error('Ad not found');
        }

        if (ad.author?.toString() !== userId) {
            res.status(401);
            throw new Error('User not authorized');
        }

        ad.title = title || ad.title;
        ad.description = description || ad.description;
        ad.price = price !== undefined ? price : ad.price;

        const updatedAd = await ad.save();
        res.json(updatedAd);
    }
);

// @desc    Delete an ad
// @route   DELETE /api/ads/:id
// @access  Private
export const deleteAd = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        const adId = req.params.id;
        const userId = req.user?.id;

        const ad = await Ad.findById(adId);

        if (!ad) {
            res.status(404);
            throw new Error('Ad not found');
        }

        if (ad.author?.toString() !== userId) {
            res.status(401);
            throw new Error('User not authorized');
        }

        await ad.deleteOne(); // Use deleteOne instead of remove
        res.json({ message: 'Ad removed' });
    }
);
