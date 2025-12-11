import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
    userId: mongoose.Types.ObjectId;
    targetType: 'Problem' | 'Answer';
    targetId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        targetType: {
            type: String,
            required: true,
            enum: ['Problem', 'Answer'],
        },
        targetId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'targetType',
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Ensure one bookmark per user per target
BookmarkSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
BookmarkSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
