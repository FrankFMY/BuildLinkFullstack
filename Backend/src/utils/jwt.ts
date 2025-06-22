import jwt from 'jsonwebtoken';

export function generateToken(id: string): string {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
    });
}

export function verifyToken(token: string): { id: string } {
    return jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
    };
}
