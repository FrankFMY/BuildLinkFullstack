import { hashPassword, comparePassword } from '../utils/hash';

describe('hash utils', () => {
    const password = 'superSecret123';
    let hash: string;

    it('корректно хеширует пароль', async () => {
        hash = await hashPassword(password);
        expect(typeof hash).toBe('string');
        expect(hash).not.toBe(password);
    });

    it('корректно сравнивает пароль и хеш', async () => {
        hash = await hashPassword(password);
        const match = await comparePassword(password, hash);
        expect(match).toBe(true);
        const fail = await comparePassword('wrong', hash);
        expect(fail).toBe(false);
    });
});
