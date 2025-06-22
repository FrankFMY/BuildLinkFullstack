import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAd extends Document {
    title: string;
    description: string;
    price: number;
    amount: number;
    type: string;
    paymentType: string;
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
        price: { type: Number, required: false, default: 0 },
        amount: { type: Number, required: false, min: 0 },
        type: { type: String, enum: ['request', 'offer'], required: true },
        paymentType: {
            type: String,
            enum: ['once', 'day', 'hour', 'month'],
            required: false,
        },
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

AdSchema.index({ type: 1 });
AdSchema.index({ paymentType: 1 });
AdSchema.index({ author: 1 });

export default mongoose.model<IAd>('Ad', AdSchema);
