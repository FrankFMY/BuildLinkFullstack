import request from 'supertest';
import app from '../app';
import User from '../models/User';
import path from 'path';

describe('User Profile API', () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
        await User.deleteMany({});
        const user = {
            username: 'profileuser',
            email: 'profileuser@example.com',
            password: 'password123',
            phone: '+79990000001',
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

    it('не отдаёт XSS в публичном профиле', async () => {
        await request(app)
            .put('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ firstName: '<script>alert(1)</script>' });
        const res = await request(app).get(`/api/users/${userId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.firstName).not.toContain('<script>');
    });

    it('можно загрузить и удалить аватар', async () => {
        const avatarPath = path.join(__dirname, 'test-avatar.png');
        const uploadRes = await request(app)
            .post('/api/users/me/avatar')
            .set('Authorization', `Bearer ${token}`)
            .attach('avatar', avatarPath);
        expect(uploadRes.statusCode).toBe(200);
        expect(uploadRes.body.avatar).toMatch(/^https:\/\/buildlink-storage/);

        // Удаление
        const delRes = await request(app)
            .delete('/api/users/me/avatar')
            .set('Authorization', `Bearer ${token}`);
        expect(delRes.statusCode).toBe(200);
        expect(delRes.body.message).toBe('Аватар удалён');

        const userAfterDelete = await User.findById(userId);
        expect(userAfterDelete).not.toBeNull();
        expect(userAfterDelete!.avatar).toBeFalsy();
    });
});
