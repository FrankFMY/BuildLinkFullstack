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

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
