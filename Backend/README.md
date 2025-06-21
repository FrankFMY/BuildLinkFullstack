# Backend — BuildLink API

Серверная часть BuildLink: REST API на Node.js/Express + MongoDB + TypeScript.

---

## Описание

Backend реализует всю бизнес-логику, хранение данных, аутентификацию, авторизацию и валидацию. Вся работа с объявлениями и пользователями — через защищённые эндпоинты.

## Архитектура

-   Express + TypeScript
-   MongoDB (Mongoose ODM)
-   JWT-аутентификация
-   Модульная структура: controllers, models, routes, middleware
-   Unit/E2E тесты (Jest, Supertest, mongodb-memory-server)

## Основные возможности

-   Регистрация и вход (JWT)
-   CRUD объявлений
-   Защита маршрутов (middleware)
-   Валидация и обработка ошибок
-   Полное покрытие тестами

## Переменные окружения

Создайте `.env` в папке Backend:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

## Запуск

```bash
npm install
npm run dev # http://localhost:8000
```

## Скрипты

-   `npm run dev` — запуск с hot-reload
-   `npm start` — обычный запуск
-   `npm run build` — компиляция TS
-   `npm test` — все тесты

## API (основные эндпоинты)

### Auth

-   `POST /api/auth/register` — регистрация
-   `POST /api/auth/login` — вход
-   `GET /api/auth/me` — профиль (JWT)

### Ads

-   `GET /api/ads` — список объявлений
-   `POST /api/ads` — создать (JWT)
-   `GET /api/ads/:id` — получить по id
-   `PUT /api/ads/:id` — обновить (JWT, автор)
-   `DELETE /api/ads/:id` — удалить (JWT, автор)

### Пример запроса

```http
POST /api/auth/register
Content-Type: application/json
{
  "username": "user1",
  "email": "user1@mail.com",
  "password": "12345678"
}
```

## Тестирование

-   `npm test` — unit + интеграционные тесты (Jest, Supertest)
-   Используется in-memory MongoDB, тесты изолированы

## Деплой

-   Любой Node.js-хостинг (Heroku, Render, Vercel, VPS)
-   MongoDB Atlas или локальный сервер
-   Не забудьте настроить переменные окружения!

## Советы по развитию

-   Соблюдайте стиль (ESLint, Prettier)
-   Все новые фичи — с тестами
-   Не храните секреты в git
-   Для сложных фич — пишите документацию

## FAQ

-   **Как добавить поле в модель?** — Измените модель, обновите контроллеры, добавьте тесты
-   **Как расширить API?** — Добавьте роут, контроллер, тесты
-   **Как сбросить базу?** — Просто перезапустите тесты, данные не сохраняются

---

_Вопросы и баги — через Issues. Вклад приветствуется!_
