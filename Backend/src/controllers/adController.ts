import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import Ad from '../models/Ad';
import { AuthRequest } from '../types';
import {
    sanitizeString,
    isValidAdType,
    isValidPaymentType,
    isValidAmount,
} from '../utils/validation';

interface AdFilter {
    type?: string;
    paymentType?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    author?: any;
    amount?: { $gte?: number; $lte?: number };
    price?: { $gte?: number; $lte?: number };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $or?: Array<{ [key: string]: { $regex: any; $options: string } }>;
}

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

    const filter: AdFilter = {};
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
            authorId:
                ad.author?._id?.toString() ||
                (typeof ad.author === 'string' ? ad.author : ''),
            createdAt: ad.createdAt,
            photos: ad.photos || [],
        }))
    );
});

// Получить объявление по id
export const getAdById = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        const ad = await Ad.findById(req.params.id).populate(
            'author',
            'username email role'
        );
        if (!ad) {
            res.status(404);
            throw new Error('Объявление не найдено');
        }
        res.json({
            id: ad._id,
            title: ad.title,
            description: ad.description,
            price: ad.price,
            type: ad.type,
            paymentType: ad.paymentType,
            amount: ad.amount,
            author: ad.author,
            authorId: ad.author?._id || '',
            created_at: ad.createdAt,
            photos: ad.photos || [],
        });
    }
);

// @desc    Create a new ad
// @route   POST /api/ads
// @access  Private
export const createAd = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        const { title, description, price, type, paymentType, amount } =
            req.body;
        if (!title || !description) {
            res.status(400).json({
                message: 'Title and description are required',
            });
            return;
        }
        if (!isValidAdType(type)) {
            res.status(400);
            throw new Error('Некорректный type (request/offer)');
        }
        if (paymentType && !isValidPaymentType(paymentType)) {
            res.status(400);
            throw new Error('Некорректный paymentType');
        }
        if (amount !== undefined && !isValidAmount(amount)) {
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
        res.status(201).json({
            id: createdAd._id,
            title: createdAd.title,
            description: createdAd.description,
            price: createdAd.price,
            type: createdAd.type,
            paymentType: createdAd.paymentType,
            amount: createdAd.amount,
            author: createdAd.author,
            created_at: createdAd.createdAt,
            photos: createdAd.photos || [],
        });
    }
);

// @desc    Update an ad
// @route   PUT /api/ads/:id
// @access  Private
export const updateAd = asyncHandler(
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
        const { title, description, price, type, paymentType, amount } =
            req.body;
        if (title) ad.title = sanitizeString(title);
        if (description) ad.description = sanitizeString(description);
        if (type) {
            if (!isValidAdType(type)) {
                res.status(400);
                throw new Error('Некорректный type (request/offer)');
            }
            ad.type = type;
        }
        if (paymentType !== undefined) {
            if (!isValidPaymentType(paymentType)) {
                res.status(400);
                throw new Error('Некорректный paymentType');
            }
            ad.paymentType = paymentType;
        }
        if (amount !== undefined) {
            if (!isValidAmount(amount)) {
                res.status(400);
                throw new Error('Некорректный amount');
            }
            const numericAmount = Number(amount);
            ad.amount = numericAmount;
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

