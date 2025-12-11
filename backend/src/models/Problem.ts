import mongoose, { Schema, Document } from 'mongoose';

interface IResource {
    type: 'link' | 'video' | 'file';
    url: string;
    title?: string;
}

export interface IProblem extends Document {
    title: string;
    descriptionMarkdown: string;
    createdBy: mongoose.Types.ObjectId;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    canonical: boolean;
    solved: boolean;
    viewCount: number;
    upvotes: number;
    downvotes: number;
    tags: string[];
    resources: IResource[];
    domainId?: mongoose.Types.ObjectId;
    subdomainId?: mongoose.Types.ObjectId;
    categoryId?: mongoose.Types.ObjectId;
    techStackId?: mongoose.Types.ObjectId;
    languageId?: mongoose.Types.ObjectId;
    topicId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        descriptionMarkdown: {
            type: String,
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        severity: {
            type: String,
            enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
            default: 'MEDIUM',
        },
        difficulty: {
            type: String,
            enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
            default: 'BEGINNER',
        },
        canonical: {
            type: Boolean,
            default: false,
        },
        solved: {
            type: Boolean,
            default: false,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        upvotes: {
            type: Number,
            default: 0,
        },
        downvotes: {
            type: Number,
            default: 0,
        },
        tags: [String],
        resources: [
            {
                type: { type: String, enum: ['link', 'video', 'file'], required: true },
                url: { type: String, required: true },
                title: String,
            },
        ],
        domainId: { type: Schema.Types.ObjectId, ref: 'Domain' },
        subdomainId: { type: Schema.Types.ObjectId, ref: 'Subdomain' },
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
        techStackId: { type: Schema.Types.ObjectId, ref: 'TechStack' },
        languageId: { type: Schema.Types.ObjectId, ref: 'Language' },
        topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for fast queries
ProblemSchema.index({ canonical: 1, upvotes: -1 });
ProblemSchema.index({ difficulty: 1, upvotes: -1 });
ProblemSchema.index({ severity: 1, createdAt: -1 });
ProblemSchema.index({ domainId: 1, canonical: 1 });
ProblemSchema.index({ subdomainId: 1, canonical: 1 });
ProblemSchema.index({ categoryId: 1, canonical: 1 });
ProblemSchema.index({ techStackId: 1, canonical: 1 });
ProblemSchema.index({ languageId: 1, canonical: 1 });
ProblemSchema.index({ topicId: 1, canonical: 1 });
ProblemSchema.index({ tags: 1 });
ProblemSchema.index({ title: 'text', descriptionMarkdown: 'text' });

export default mongoose.model<IProblem>('Problem', ProblemSchema);
