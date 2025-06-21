import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app'; // Corrected import path
import User from '../models/User';

describe('Auth Endpoints', () => {
    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
    };

    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.username).toBe(testUser.username);
    });

    it('should not register a user with an existing email', async () => {
        // First, create a user
        await request(app).post('/api/auth/register').send(testUser);

        // Then, try to register again with the same email
        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...testUser, username: 'anotheruser' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('User already exists');
    });

    it('should login an existing user with email', async () => {
        await request(app).post('/api/auth/register').send(testUser);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: testUser.email, password: testUser.password }); // Using email as username field

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('access_token');
    });

    it('should login an existing user with username', async () => {
        await request(app).post('/api/auth/register').send(testUser);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: testUser.username, password: testUser.password });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('access_token');
    });

    it('should not login with incorrect password', async () => {
        await request(app).post('/api/auth/register').send(testUser);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: testUser.username, password: 'wrongpassword' });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe('Invalid credentials');
    });

    it('should not login a non-existent user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'nouser', password: 'password' });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe('Invalid credentials');
    });

    it('should get user profile with a valid token', async () => {
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        const token = registerRes.body.token;

        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.email).toBe(testUser.email);
    });

    it('should not get user profile with an invalid token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer invalidtoken');

        expect(res.statusCode).toEqual(401);
    });
});
