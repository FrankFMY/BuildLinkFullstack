import sanitizeHtml from 'sanitize-html';

// XSS-фильтрация строки
export function sanitizeString(str: string): string {
    return sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} });
}

// Валидация email
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
    return typeof email === 'string' && emailRegex.test(email);
}

// Валидация username
export function isValidUsername(username: string): boolean {
    return (
        typeof username === 'string' &&
        username.length >= 3 &&
        username.length <= 32
    );
}

// Валидация телефона
export function isValidPhone(phone: string): boolean {
    return typeof phone === 'string' && phone.length >= 7 && phone.length <= 32;
}

// Валидация типа объявления
export function isValidAdType(type: string): boolean {
    return ['request', 'offer'].includes(type);
}

// Валидация типа оплаты
export function isValidPaymentType(paymentType: string): boolean {
    return ['once', 'day', 'hour', 'month'].includes(paymentType);
}

// Валидация amount
export function isValidAmount(amount: any): boolean {
    return typeof amount === 'number' && !isNaN(amount) && amount >= 0;
}

// Пример использования:
// import { sanitizeString, isValidEmail } from './validation';
// const safe = sanitizeString(input);
// if (!isValidEmail(email)) throw new Error('Некорректный email');
