// User types
export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    roles: string[];
    bio?: string;
    interests: string[];
}

// Classification types
export interface Domain {
    _id: string;
    name: string;
    slug: string;
    description?: string;
}

export interface Subdomain {
    _id: string;
    domainId: string;
    name: string;
    slug: string;
}

export interface Category {
    _id: string;
    subdomainId: string;
    name: string;
    slug: string;
}

export interface TechStack {
    _id: string;
    categoryId: string;
    name: string;
    slug: string;
}

export interface Language {
    _id: string;
    techStackId: string;
    name: string;
    slug: string;
}

export interface Topic {
    _id: string;
    languageId: string;
    name: string;
    slug: string;
}

// Problem types
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Resource {
    type: 'link' | 'video' | 'file';
    url: string;
    title?: string;
}

export interface Problem {
    _id: string;
    title: string;
    descriptionMarkdown: string;
    createdBy: {
        _id: string;
        name: string;
        avatarUrl?: string;
    };
    severity: Severity;
    difficulty: Difficulty;
    canonical: boolean;
    solved: boolean;
    viewCount: number;
    upvotes: number;
    downvotes: number;
    tags: string[];
    resources: Resource[];
    domainId?: string;
    subdomainId?: string;
    categoryId?: string;
    techStackId?: string;
    languageId?: string;
    topicId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Answer {
    _id: string;
    problemId: string;
    authorId: {
        _id: string;
        name: string;
        avatarUrl?: string;
        roles: string[];
    };
    contentMarkdown: string;
    upvotes: number;
    accepted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    _id: string;
    parentId: string;
    parentType: 'Problem' | 'Answer';
    authorId: {
        _id: string;
        name: string;
        avatarUrl?: string;
    };
    content: string;
    createdAt: string;
}

export interface ProblemFilters {
    page?: number;
    limit?: number;
    domainId?: string;
    subdomainId?: string;
    categoryId?: string;
    techStackId?: string;
    languageId?: string;
    topicId?: string;
    severity?: Severity;
    difficulty?: Difficulty;
    canonical?: boolean;
    solved?: boolean;
    search?: string;
    sort?: 'popular' | 'views' | 'newest' | 'oldest';
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
