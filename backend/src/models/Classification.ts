import mongoose, { Schema, Document } from 'mongoose';

// Domain
export interface IDomain extends Document {
    name: string;
    slug: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DomainSchema = new Schema<IDomain>(
    {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String },
    },
    { timestamps: true }
);

DomainSchema.index({ slug: 1 });

export const Domain = mongoose.model<IDomain>('Domain', DomainSchema);

// Subdomain
export interface ISubdomain extends Document {
    domainId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const SubdomainSchema = new Schema<ISubdomain>(
    {
        domainId: { type: Schema.Types.ObjectId, ref: 'Domain', required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
    },
    { timestamps: true }
);

SubdomainSchema.index({ domainId: 1, slug: 1 });

export const Subdomain = mongoose.model<ISubdomain>('Subdomain', SubdomainSchema);

// Category
export interface ICategory extends Document {
    subdomainId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        subdomainId: { type: Schema.Types.ObjectId, ref: 'Subdomain', required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
    },
    { timestamps: true }
);

CategorySchema.index({ subdomainId: 1, slug: 1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);

// TechStack
export interface ITechStack extends Document {
    categoryId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const TechStackSchema = new Schema<ITechStack>(
    {
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
    },
    { timestamps: true }
);

TechStackSchema.index({ categoryId: 1, slug: 1 });

export const TechStack = mongoose.model<ITechStack>('TechStack', TechStackSchema);

// Language
export interface ILanguage extends Document {
    techStackId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const LanguageSchema = new Schema<ILanguage>(
    {
        techStackId: { type: Schema.Types.ObjectId, ref: 'TechStack', required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
    },
    { timestamps: true }
);

LanguageSchema.index({ techStackId: 1, slug: 1 });

export const Language = mongoose.model<ILanguage>('Language', LanguageSchema);

// Topic
export interface ITopic extends Document {
    languageId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
    {
        languageId: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
    },
    { timestamps: true }
);

TopicSchema.index({ languageId: 1, slug: 1 });

export const Topic = mongoose.model<ITopic>('Topic', TopicSchema);
