import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer extends Document {
    problemId: mongoose.Types.ObjectId;
    authorId: mongoose.Types.ObjectId;
    contentMarkdown: string;
    upvotes: number;
    accepted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
    {
        problemId: {
            type: Schema.Types.ObjectId,
            ref: 'Problem',
            required: true,
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        contentMarkdown: {
            type: String,
            required: true,
        },
        upvotes: {
            type: Number,
            default: 0,
        },
        accepted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
AnswerSchema.index({ problemId: 1, accepted: -1 });
AnswerSchema.index({ problemId: 1, upvotes: -1 });
AnswerSchema.index({ authorId: 1 });

export default mongoose.model<IAnswer>('Answer', AnswerSchema);
