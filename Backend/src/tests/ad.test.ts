let app: any, request: any, User: any, Ad: any;
let token: string, userId: string;
import path from 'path';
import assert from 'assert';

beforeAll(async () => {
    const { setupTestDB } = require('./setup');
    await setupTestDB();
    app = require('../app').default;
    request = require('supertest');
    User = require('../models/User').default;
    Ad = require('../models/Ad').default;

    // Create a user and get token
    const user = {
        username: 'adtester',
        email: 'adtester@example.com',
        password: 'password123',
        phone: '+79990000003',
    };
    const registerRes = await request(app)
        .post('/api/auth/register')
        .send(user);
    userId = registerRes.body._id;
    token = registerRes.body.token;
});

beforeEach(async () => {
    await Ad.deleteMany({});
});

describe('Ads Endpoints', () => {
    it('should create a new ad for an authenticated user', async () => {
        const res = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'New Ad',
                description: 'Ad description',
                price: 100,
                type: 'offer',
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
            .send({
                title: 'Test Ad',
                description: 'Test desc',
                price: 50,
                type: 'offer',
            });

        const res = await request(app).get('/api/ads');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].title).toBe('Test Ad');
    });

    it('should allow the author to update their ad', async () => {
        const adRes = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Original Title',
                description: 'Original desc',
                type: 'offer',
            });

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
            .send({
                title: 'Another User Ad',
                description: '...',
                type: 'offer',
            });
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
            .send({
                title: 'To Be Deleted',
                description: '...',
                type: 'offer',
            });
        const adId = adRes.body._id;

        const res = await request(app)
            .delete(`/api/ads/${adId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Ad removed');
    });

    it('не создаёт объявление с XSS в title', async () => {
        const res = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: '<script>alert(1)</script>',
                description: 'desc',
                price: 1,
                type: 'offer',
            });
        // Ожидаем 400 или экранирование (зависит от политики)
        expect([400, 201]).toContain(res.statusCode);
        if (res.statusCode === 201) {
            expect(res.body.title).not.toContain('<script>');
        }
    });

    it('не создаёт объявление с очень длинным title', async () => {
        const longTitle = 'a'.repeat(300);
        const res = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: longTitle,
                description: 'desc',
                price: 1,
                type: 'offer',
            });
        expect(res.statusCode).toBe(400);
    });

    it('не создаёт объявление с пустым description', async () => {
        const res = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Test', description: '', price: 1, type: 'offer' });
        expect(res.statusCode).toBe(400);
    });

    it('создаёт объявление с новыми полями', async () => {
        const res = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Offer',
                description: 'Offer desc',
                price: 200,
                type: 'offer',
                paymentType: 'day',
                amount: 5,
            });
        expect(res.statusCode).toBe(201);
        expect(res.body.type).toBe('offer');
        expect(res.body.paymentType).toBe('day');
        expect(res.body.amount).toBe(5);
    });

    it('фильтрует объявления по type', async () => {
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Req',
                description: '...',
                price: 1,
                type: 'request',
            });
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Off',
                description: '...',
                price: 2,
                type: 'offer',
            });
        const res = await request(app).get('/api/ads?type=offer');
        expect(res.body.length).toBe(1);
        expect(res.body[0].type).toBe('offer');
    });

    it('фильтрует по paymentType', async () => {
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'AAA',
                description: '...',
                price: 1,
                type: 'offer',
                paymentType: 'hour',
                amount: 2,
            });
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'BBB',
                description: '...',
                price: 1,
                type: 'offer',
                paymentType: 'day',
                amount: 10,
            });
        const res = await request(app).get('/api/ads?paymentType=day');
        expect(res.body.length).toBe(1);
        expect(res.body[0].paymentType).toBe('day');
    });

    it('фильтрует по amount', async () => {
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'AAA',
                description: '...',
                price: 1,
                type: 'offer',
                paymentType: 'hour',
                amount: 2,
            });
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'BBB',
                description: '...',
                price: 1,
                type: 'offer',
                paymentType: 'day',
                amount: 10,
            });
        const res = await request(app).get('/api/ads?minAmount=5');
        expect(res.body.length).toBe(1);
        expect(res.body[0].amount).toBe(10);
    });

    it('фильтрует по paymentType и amount', async () => {
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'AAA',
                description: '...',
                price: 1,
                type: 'offer',
                paymentType: 'hour',
                amount: 2,
            });
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'BBB',
                description: '...',
                price: 1,
                type: 'offer',
                paymentType: 'day',
                amount: 10,
            });
        const res = await request(app).get(
            '/api/ads?paymentType=day&minAmount=5'
        );
        expect(res.body.length).toBe(1);
        expect(res.body[0].amount).toBe(10);
    });

    it('фильтрует по цене', async () => {
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Cheap',
                description: '...',
                price: 10,
                type: 'offer',
            });
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Exp',
                description: '...',
                price: 100,
                type: 'offer',
            });
        const res = await request(app).get('/api/ads?minPrice=50');
        expect(res.body.length).toBe(1);
        expect(res.body[0].price).toBe(100);
    });

    it('ищет по тексту', async () => {
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'SpecialWord',
                description: '...',
                price: 1,
                type: 'offer',
            });
        const res = await request(app).get('/api/ads?search=SpecialWord');
        expect(res.body.length).toBe(1);
        expect(res.body[0].title).toBe('SpecialWord');
    });

    it('после создания объявления оно есть в базе (debug)', async () => {
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Debug',
                description: '...',
                price: 1,
                type: 'offer',
                paymentType: 'day',
                amount: 42,
            });
        const ads = await Ad.find({ paymentType: 'day', amount: 42 });
        console.log('DEBUG DB ADS:', ads);
        expect(ads.length).toBe(1);
        expect(ads[0].amount).toBe(42);
    });

    it('не создаёт объявление с отрицательным amount', async () => {
        const res = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Bad',
                description: 'desc',
                price: 1,
                type: 'offer',
                paymentType: 'day',
                amount: -5,
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/amount/i);
    });

    it('не создаёт объявление с невалидным paymentType', async () => {
        const res = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Bad',
                description: 'desc',
                price: 1,
                type: 'offer',
                paymentType: 'invalid',
                amount: 5,
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/paymentType/i);
    });

    it('не создаёт объявление с невалидным type', async () => {
        const res = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Bad',
                description: 'desc',
                price: 1,
                type: 'badtype',
                paymentType: 'day',
                amount: 5,
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/type/i);
    });

    it('не создаёт объявление с нечисловым amount', async () => {
        const res = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Bad',
                description: 'desc',
                price: 1,
                type: 'offer',
                paymentType: 'day',
                amount: 'abc',
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/amount/i);
    });

    it('не создаёт объявление с XSS в description', async () => {
        const res = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'XSS',
                description: '<img src=x onerror=alert(1)>',
                price: 1,
                type: 'offer',
                paymentType: 'day',
                amount: 5,
            });
        expect([400, 201]).toContain(res.statusCode);
        if (res.statusCode === 201) {
            expect(res.body.description).not.toContain('<img');
        }
    });

    it('фильтрует по несуществующему paymentType', async () => {
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'AAA',
                description: '...',
                price: 1,
                type: 'offer',
                paymentType: 'hour',
                amount: 2,
            });
        const res = await request(app).get('/api/ads?paymentType=notype');
        expect(res.body.length).toBe(0);
    });

    it('фильтрует по нескольким параметрам (type+paymentType+amount)', async () => {
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'AAA',
                description: '...',
                price: 1,
                type: 'offer',
                paymentType: 'hour',
                amount: 2,
            });
        await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'BBB',
                description: '...',
                price: 1,
                type: 'offer',
                paymentType: 'day',
                amount: 10,
            });
        const res = await request(app).get(
            '/api/ads?type=offer&paymentType=day&minAmount=5'
        );
        expect(res.body.length).toBe(1);
        expect(res.body[0].paymentType).toBe('day');
        expect(res.body[0].amount).toBe(10);
    });

    it('можно загрузить и удалить фото объявления', async () => {
        // Создаём объявление
        const adRes = await request(app)
            .post('/api/ads')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Ad with Photo',
                description: '...',
                type: 'offer',
            });
        const adId = adRes.body._id;

        // Загружаем фото
        const photoPath = path.join(__dirname, 'test-photo.png');
        const uploadRes = await request(app)
            .post(`/api/ads/${adId}/photos`)
            .set('Authorization', `Bearer ${token}`)
            .attach('photos', photoPath);

        expect(uploadRes.statusCode).toBe(200);
        expect(uploadRes.body.photos[0]).toMatch(
            /^https:\/\/buildlink-storage.storage.yandexcloud.net\//
        );

        // Удаляем фото сразу после загрузки
        const photoUrl = uploadRes.body.photos[0];
        const photoKey = photoUrl.split('/').pop();

        const delRes = await request(app)
            .delete(`/api/ads/${adId}/photos/${photoKey}`)
            .set('Authorization', `Bearer ${token}`);

        expect(delRes.statusCode).toBe(200);
        expect(delRes.body.message).toBe('Фото удалено');

        // Проверяем, что фото реально удалено из объявления в БД
        const adAfter = await Ad.findById(adId);
        expect(adAfter.photos.length).toBe(0);
    });
});

