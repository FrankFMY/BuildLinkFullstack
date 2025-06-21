import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAd extends Document {
    title: string;
    description: string;
    price: number;
    author: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AdSchema: Schema = new Schema(
    {
        title: { type: String, required: true, minlength: 3, maxlength: 128 },
        description: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 1024,
        },
        price: { type: Number, required: true, default: 0 },
        author: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IAd>('Ad', AdSchema);
