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
            .send({
                firstName: 'Иван',
                lastName: 'Иванов',
                city: 'Москва',
                age: 30,
            });
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

    it('не даёт изменить роль через профиль', async () => {
        const res = await request(app)
            .put('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ role: 'seller' });
        expect(res.statusCode).toBe(400);
    });

    it('не даёт XSS в firstName', async () => {
        const res = await request(app)
            .put('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ firstName: '<script>alert(1)</script>' });
        expect(res.statusCode).toBe(200);
        expect(res.body.user.firstName).not.toContain('<script>');
    });

    it('валидация email (некорректный email)', async () => {
        const res = await request(app)
            .put('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ email: 'notanemail' });
        expect(res.statusCode).toBe(400);
    });

    it('валидация username (слишком короткий)', async () => {
        const res = await request(app)
            .put('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ username: 'a' });
        expect(res.statusCode).toBe(400);
    });

    it('валидация длинных значений', async () => {
        const longName = 'a'.repeat(100);
        const res = await request(app)
            .put('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ firstName: longName });
        expect(res.statusCode).toBe(400);
    });

    it('не отдаёт профиль по несуществующему id', async () => {
        const res = await request(app).get(
            '/api/users/507f1f77bcf86cd799439011'
        );
        expect(res.statusCode).toBe(404);
    });

    it('не отдаёт email и role в публичном профиле', async () => {
        // Обновляем профиль, чтобы были заполнены все поля
        await request(app)
            .put('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstName: 'Иван',
                lastName: 'Иванов',
                city: 'Москва',
                age: 30,
            });
        const res = await request(app).get(`/api/users/${userId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).not.toHaveProperty('email');
        expect(res.body).not.toHaveProperty('role');
    });

    it('не отдаёт XSS в публичном профиле', async () => {
        await request(app)
            .put('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ firstName: '<script>alert(1)</script>' });
        const res = await request(app).get(`/api/users/${userId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.firstName).not.toContain('<script>');
    });

    it('можно сменить роль на seller', async () => {
        const res = await request(app)
            .put('/api/users/me/role')
            .set('Authorization', `Bearer ${token}`)
            .send({ role: 'seller' });
        expect(res.statusCode).toBe(200);
        expect(res.body.role).toBe('seller');
    });

    it('не даёт сменить роль на XSS', async () => {
        const res = await request(app)
            .put('/api/users/me/role')
            .set('Authorization', `Bearer ${token}`)
            .send({ role: '<script>alert(1)</script>' });
        expect(res.statusCode).toBe(400);
    });

    it('не даёт сменить роль на невалидную', async () => {
        const res = await request(app)
            .put('/api/users/me/role')
            .set('Authorization', `Bearer ${token}`)
            .send({ role: 'admin' });
        expect(res.statusCode).toBe(400);
    });

    it('не даёт сменить роль без токена', async () => {
        const res = await request(app)
            .put('/api/users/me/role')
            .send({ role: 'seller' });
        expect(res.statusCode).toBe(401);
    });
});
