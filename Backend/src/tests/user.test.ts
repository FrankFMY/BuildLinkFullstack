import request from 'supertest';
import app from '../app';
import User from '../models/User';

describe('User Profile API', () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
        const user = {
            username: 'profileuser',
            email: 'profileuser@example.com',
            password: 'password123',
        };
        const res = await request(app).post('/api/auth/register').send(user);
        token = res.body.token || res.body.access_token;
        const dbUser = await User.findOne({ username: user.username });
        userId = dbUser?._id?.toString() || '';
    });

    it('доступен публичный профиль', async () => {
        const res = await request(app).get(`/api/users/${userId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('username', 'profileuser');
        expect(res.body).not.toHaveProperty('password');
        expect(res.body).not.toHaveProperty('email');
    });

    it('можно редактировать свой профиль', async () => {
        const res = await request(app)
            .put('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ firstName: 'Иван', lastName: 'Иванов', city: 'Москва', age: 30 });
        expect(res.statusCode).toBe(200);
        expect(res.body.user).toHaveProperty('firstName', 'Иван');
        expect(res.body.user).toHaveProperty('city', 'Москва');
        expect(res.body.user).toHaveProperty('age', 30);
    });

    it('нельзя редактировать профиль без токена', async () => {
        const res = await request(app)
            .put('/api/users/me')
            .send({ firstName: 'Хакер' });
        expect(res.statusCode).toBe(401);
    });

    it('валидация возраста (отрицательное значение)', async () => {
        const res = await request(app)
            .put('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ age: -5 });
        expect(res.statusCode).toBe(400);
    });
});
