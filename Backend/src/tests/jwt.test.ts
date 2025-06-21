import { generateToken, verifyToken } from '../utils/jwt';

beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
});

describe('jwt utils', () => {
    const userId = 'testid123';
    let token: string;

    it('генерирует валидный JWT', () => {
        token = generateToken(userId);
        expect(typeof token).toBe('string');
        const payload = verifyToken(token);
        expect(payload.id).toBe(userId);
    });

    it('выбрасывает ошибку при невалидном токене', () => {
        expect(() => verifyToken('bad.token.value')).toThrow();
    });
});
