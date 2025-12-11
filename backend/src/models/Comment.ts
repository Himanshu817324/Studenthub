import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
    parentId: mongoose.Types.ObjectId;
    parentType: 'Problem' | 'Answer';
    authorId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
    {
        parentId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'parentType',
        },
        parentType: {
            type: String,
            required: true,
            enum: ['Problem', 'Answer'],
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
CommentSchema.index({ parentId: 1, createdAt: 1 });
CommentSchema.index({ authorId: 1 });

export default mongoose.model<IComment>('Comment', CommentSchema);
