import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import User from '../models/User';
import Ad from '../models/Ad';

describe('Ads Endpoints', () => {
    let token: string;
    let userId: string;

    beforeAll(async () => {
        // Create a user and get token
        const user = {
            username: 'adtester',
            email: 'adtester@example.com',
            password: 'password123',
        };
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send(user);
        userId = registerRes.body._id;
        token = registerRes.body.token;
    });

    // Clear ads before each test
    beforeEach(async () => {
        await Ad.deleteMany({});
    });

    it('should create a new ad for an authenticated user', async () => {
        const res = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'New Ad',
                description: 'Ad description',
                price: 100,
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toBe('New Ad');
        expect(res.body.author.toString()).toBe(userId);
    });

    it('should not create an ad with missing title', async () => {
        const res = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({ description: 'Ad description', price: 100 });

        expect(res.statusCode).toEqual(400);
    });

    it('should get all ads', async () => {
        // Create an ad first
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Test Ad', description: 'Test desc', price: 50 });

        const res = await request(app).get('/api/ads');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].title).toBe('Test Ad');
    });

    it('should allow the author to update their ad', async () => {
        const adRes = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Original Title', description: 'Original desc' });

        const adId = adRes.body._id;
        const res = await request(app)
            .put(`/api/ads/${adId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated Title' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe('Updated Title');
    });

    it("should not allow a user to update another user's ad", async () => {
        // Create ad with user 1
        const adRes = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Another User Ad', description: '...' });
        const adId = adRes.body._id;

        // Create user 2
        const anotherUser = await request(app).post('/api/auth/register').send({
            username: 'user2',
            email: 'user2@test.com',
            password: '123',
        });
        const anotherToken = anotherUser.body.token;

        // Try to update with user 2's token
        const res = await request(app)
            .put(`/api/ads/${adId}`)
            .set('Authorization', `Bearer ${anotherToken}`)
            .send({ title: 'Illegal Update' });

        expect(res.statusCode).toEqual(401);
    });

    it('should allow the author to delete their ad', async () => {
        const adRes = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'To Be Deleted', description: '...' });
        const adId = adRes.body._id;

        const res = await request(app)
            .delete(`/api/ads/${adId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Ad removed');
    });
});
