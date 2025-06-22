import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import Ad from '../models/Ad';
import { AuthRequest } from '../types';
import sanitizeHtml from 'sanitize-html';

// @desc    Get all ads
// @route   GET /api/ads
// @access  Public
export const getAds = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
        type,
        paymentType,
        minAmount,
        maxAmount,
        minPrice,
        maxPrice,
        author,
        role,
        search,
    } = req.query;

    const filter: any = {};
    // Приведение типов фильтра
    if (type) filter.type = String(type);
    if (paymentType) filter.paymentType = String(paymentType);
    if (author) filter.author = author;
    if (minAmount || maxAmount) {
        filter.amount = {};
        if (minAmount) filter.amount.$gte = Number(minAmount);
        if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    let adsQuery = Ad.find(filter).populate('author', 'username email role');
    if (role) {
        adsQuery = adsQuery.where('author.role').equals(role);
    }
    const ads = await adsQuery.exec();

    res.json(
        ads.map((ad) => ({
            id: ad._id,
            title: ad.title,
            description: ad.description,
            price: ad.price,
            amount: ad.amount,
            type: ad.type,
            paymentType: ad.paymentType,
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
        let { title, description, price, type, paymentType, amount } = req.body;
        title = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });
        description = sanitizeHtml(description, {
            allowedTags: [],
            allowedAttributes: {},
        });
        if (!title || !description) {
            res.status(400);
            throw new Error('Title and description are required');
        }
        if (!type || !['request', 'offer'].includes(type)) {
            res.status(400);
            throw new Error('Некорректный type (request/offer)');
        }
        if (
            paymentType &&
            !['once', 'day', 'hour', 'month'].includes(paymentType)
        ) {
            res.status(400);
            throw new Error('Некорректный paymentType');
        }
        if (amount !== undefined && (isNaN(amount) || amount < 0)) {
            res.status(400);
            throw new Error('Некорректный amount');
        }
        const ad = new Ad({
            title,
            description,
            price: price || 0,
            type,
            paymentType,
            amount,
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
        let { title, description, price, type, paymentType, amount } = req.body;
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
        if (title)
            ad.title = sanitizeHtml(title, {
                allowedTags: [],
                allowedAttributes: {},
            });
        if (description)
            ad.description = sanitizeHtml(description, {
                allowedTags: [],
                allowedAttributes: {},
            });
        if (type) {
            if (!['request', 'offer'].includes(type)) {
                res.status(400);
                throw new Error('Некорректный type (request/offer)');
            }
            ad.type = type;
        }
        if (paymentType !== undefined) {
            if (
                paymentType &&
                !['once', 'day', 'hour', 'month'].includes(paymentType)
            ) {
                res.status(400);
                throw new Error('Некорректный paymentType');
            }
            ad.paymentType = paymentType;
        }
        if (amount !== undefined) {
            if (isNaN(amount) || amount < 0) {
                res.status(400);
                throw new Error('Некорректный amount');
            }
            amount = Number(amount);
        }
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
