import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import sharp from 'sharp';
import { uploadToS3, deleteFromS3 } from '../utils/s3Utils';
import User from '../models/User';
import Ad from '../models/Ad';
import { AuthRequest } from '../types';
import fs from 'fs';
import path from 'path';

// Проверяем, настроен ли S3
const isS3Configured = !!(
    process.env.YC_REGION &&
    process.env.YC_ENDPOINT &&
    process.env.YC_KEY_ID &&
    process.env.YC_SECRET &&
    process.env.YC_BUCKET &&
    process.env.YC_REGION !== '' &&
    process.env.YC_ENDPOINT !== '' &&
    process.env.YC_KEY_ID !== '' &&
    process.env.YC_SECRET !== '' &&
    process.env.YC_BUCKET !== ''
);

console.log('S3 Configuration check:', {
    YC_REGION: !!process.env.YC_REGION,
    YC_ENDPOINT: !!process.env.YC_ENDPOINT,
    YC_KEY_ID: !!process.env.YC_KEY_ID,
    YC_SECRET: !!process.env.YC_SECRET,
    YC_BUCKET: !!process.env.YC_BUCKET,
    isS3Configured,
});

// Создаем папку для локальных файлов
const uploadsDir = path.join(__dirname, '../../uploads');
if (!isS3Configured && !fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 МБ
    storage: multer.memoryStorage(),
    fileFilter: (
        _req: Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback
    ) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Только изображения'));
        }
        cb(null, true);
    },
});

// Функция для локального сохранения файла
async function saveFileLocally(
    filename: string,
    buffer: Buffer
): Promise<string> {
    const filePath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filePath, buffer);
    return `/uploads/${filename}`;
}

// Функция для удаления локального файла
async function deleteFileLocally(filename: string): Promise<void> {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
    }
}

// Загрузка/замена аватара
export const uploadAvatar = [
    upload.single('avatar'),
    asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as AuthRequest).user?.id;
        const file = req.file as Express.Multer.File;
        if (!file) throw new Error('Файл не загружен');
        const user = await User.findById(userId);
        if (!user) throw new Error('Пользователь не найден');

        // Оптимизация изображения
        const buffer = await sharp(file.buffer)
            .resize(256, 256, { fit: 'cover' })
            .toFormat('webp')
            .toBuffer();

        let url: string;
        if (isS3Configured) {
            const key = `avatars/${user._id}.webp`;
            url = await uploadToS3(key, buffer, 'image/webp');
            // Удаляем старый аватар, если был
            if (user.avatar && user.avatar.includes('avatars/')) {
                const oldKey = user.avatar.split('.net/')[1];
                if (oldKey && oldKey !== key) await deleteFromS3(oldKey);
            }
        } else {
            // Локальное сохранение
            const filename = `avatar-${user._id}.webp`;
            url = await saveFileLocally(filename, buffer);
            // Удаляем старый локальный аватар
            if (user.avatar && user.avatar.startsWith('/uploads/')) {
                const oldFilename = user.avatar.replace('/uploads/', '');
                await deleteFileLocally(oldFilename);
            }
        }

        // Обновляем только поле avatar
        await User.updateOne({ _id: userId }, { avatar: url });
        res.json({ avatar: url });
    }),
];

// Удаление аватара
export const deleteAvatar = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        const user = await User.findById(req.user?.id);
        if (!user) throw new Error('Пользователь не найден');

        if (user.avatar) {
            if (isS3Configured && user.avatar.includes('avatars/')) {
                const key = user.avatar.split('.net/')[1];
                await deleteFromS3(key);
            } else if (user.avatar.startsWith('/uploads/')) {
                const filename = user.avatar.replace('/uploads/', '');
                await deleteFileLocally(filename);
            }
        }

        // Обновляем только поле avatar
        await User.updateOne({ _id: user._id }, { avatar: '' });
        res.json({ message: 'Аватар удалён' });
    }
);

// Загрузка фото для объявления (до 6)
export const uploadAdPhotos = [
    upload.array('photos', 6),
    asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as AuthRequest).user?.id;
        const adId = req.body.adId || req.params.id;
        const ad = await Ad.findById(adId);
        if (!ad) throw new Error('Объявление не найдено');
        if (ad!.author.toString() !== userId) throw new Error('Нет доступа');
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) throw new Error('Нет файлов');
        if (ad!.photos.length + files.length > 6)
            throw new Error('Максимум 6 фото');
        const uploaded: string[] = [];
        for (const file of files) {
            const buffer = await sharp(file.buffer)
                .resize(1024, 1024, { fit: 'inside' })
                .toFormat('webp')
                .toBuffer();
            const key = `ads/${
                ad._id
            }/${Date.now()}-${file.originalname.replace(/\s/g, '')}.webp`;
            const url = await uploadToS3(key, buffer, 'image/webp');
            ad!.photos.push(url);
            uploaded.push(url);
        }
        await ad!.save();
        res.json({ photos: uploaded, allPhotos: ad!.photos });
    }),
];

// Удаление фото объявления
export const deleteAdPhoto = asyncHandler(
    async (req: AuthRequest, res: Response) => {
        const { id, photoKey } = req.params;
        const ad = await Ad.findById(id);
        if (!ad) throw new Error('Объявление не найдено');
        if (ad.author.toString() !== req.user?.id)
            throw new Error('Нет доступа');
        let key = photoKey;
        if (!photoKey.includes('/')) {
            key = `ads/${id}/${photoKey}`;
        }
        const url = ad.photos.find((p) => p.includes(key));
        if (!url) throw new Error('Фото не найдено');
        await deleteFromS3(key);
        ad.photos = ad.photos.filter((p) => !p.includes(key));
        await ad.save();
        res.json({ message: 'Фото удалено' });
    }
);

export { upload };

