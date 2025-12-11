import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

interface IOAuthProvider {
    provider: string;
    id: string;
}

export interface IUser extends Document {
    name: string;
    email: string;
    avatarUrl?: string;
    passwordHash?: string;
    oauthProviders: IOAuthProvider[];
    roles: string[];
    bio?: string;
    interests: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        avatarUrl: {
            type: String,
        },
        passwordHash: {
            type: String,
        },
        oauthProviders: [
            {
                provider: { type: String, required: true },
                id: { type: String, required: true },
            },
        ],
        roles: {
            type: [String],
            default: ['user'],
            enum: ['user', 'moderator', 'admin'],
        },
        bio: {
            type: String,
            maxlength: 500,
        },
        interests: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Domain',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash') || !this.passwordHash) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    if (!this.passwordHash) {
        return false;
    }
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ 'oauthProviders.provider': 1, 'oauthProviders.id': 1 });

export default mongoose.model<IUser>('User', UserSchema);
