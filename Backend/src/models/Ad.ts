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
        title: { type: String, required: true },
        description: { type: String, required: true },
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
