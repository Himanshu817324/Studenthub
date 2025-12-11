import request from 'supertest';
import app from '../src/server';
import User from '../src/models/User';
import connectDB from '../src/config/database';
import mongoose from 'mongoose';
import { beforeEach } from 'node:test';

describe('Auth Routes', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('POST /api/auth/signup', () => {
        it('should create a new user', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body.user.email).toBe('test@example.com');
        });

        it('should reject duplicate email', async () => {
            await User.create({
                name: 'Existing User',
                email: 'test@example.com',
                passwordHash: 'hashedpassword',
                roles: ['user'],
                oauthProviders: [],
            });

            const response = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Email already registered');
        });

        it('should reject invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'invalid-email',
                    password: 'password123',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            const user = new User({
                name: 'Test User',
                email: 'test@example.com',
                passwordHash: 'password123',
                roles: ['user'],
                oauthProviders: [],
            });
            await user.save();
        });

        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
        });

        it('should reject invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });

            expect(response.status).toBe(401);
        });
    });
});
function beforeAll(arg0: () => Promise<void>) {
    throw new Error('Function not implemented.');
}

function afterAll(arg0: () => Promise<void>) {
    throw new Error('Function not implemented.');
}

function expect(status: number) {
    throw new Error('Function not implemented.');
}

