import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
    userId: mongoose.Types.ObjectId;
    targetType: 'Problem' | 'Answer' | 'Comment';
    targetId: mongoose.Types.ObjectId;
    value: 1 | -1;
    createdAt: Date;
    updatedAt: Date;
}

const VoteSchema = new Schema<IVote>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        targetType: {
            type: String,
            required: true,
            enum: ['Problem', 'Answer', 'Comment'],
        },
        targetId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'targetType',
        },
        value: {
            type: Number,
            required: true,
            enum: [1, -1],
        },
    },
    {
        timestamps: true,
    }
);

// Ensure one vote per user per target
VoteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
VoteSchema.index({ targetId: 1, targetType: 1 });

export default mongoose.model<IVote>('Vote', VoteSchema);
