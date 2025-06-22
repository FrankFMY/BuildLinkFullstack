import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;

const UserSchema: Schema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 32,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [emailRegex, 'Некорректный email'],
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 128,
    },
    firstName: { type: String, trim: true, maxlength: 32 },
    lastName: { type: String, trim: true, maxlength: 32 },
    middleName: { type: String, trim: true, maxlength: 32 },
    city: { type: String, trim: true, maxlength: 64 },
    age: { type: Number, min: 0, max: 120 },
    timezone: { type: String, trim: true, maxlength: 64 },
    avatar: { type: String, trim: true, maxlength: 256 },
    role: {
        type: String,
        enum: ['client', 'seller', 'both'],
        default: 'client',
    },
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.index({ role: 1 });

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
