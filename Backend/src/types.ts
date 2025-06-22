import { Document, Schema } from 'mongoose';
import { Request } from 'express';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    city?: string;
    age?: number;
    timezone?: string;
    avatar?: string;
    phone: string;
}

export interface IAd extends Document {
    title: string;
    description: string;
    author: Schema.Types.ObjectId | IUser;
    type: 'request' | 'offer';
    paymentType?: 'once' | 'day' | 'hour' | 'month';
    amount?: number;
    price?: number; // для обратной совместимости
    photos?: string[];
}

export interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}
