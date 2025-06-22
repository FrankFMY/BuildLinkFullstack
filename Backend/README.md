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

Скопируйте `.env.example` в `.env` и укажите свои значения:

```
# Yandex Cloud Storage
YC_BUCKET=
YC_KEY_ID=
YC_SECRET=
YC_REGION=ru-central1
YC_ENDPOINT=https://storage.yandexcloud.net

# Database
MONGO_URI=mongodb://localhost:27017/buildlink-db

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key
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

## Документация API

Swagger UI: [http://localhost:8000/api-docs](http://localhost:8000/api-docs)

## Безопасность

-   helmet: HTTP security headers
-   express-rate-limit: ограничение частоты запросов
-   sanitize-html: защита от XSS
-   CORS: только http://localhost:5173

## Интеграция с Yandex.Cloud Object Storage (S3)

Для хранения аватаров и фото объявлений используется S3-совместимое хранилище (Yandex.Cloud Object Storage).

### Переменные окружения (добавьте в .env):

Этот файл уже должен быть настроен, если вы следовали инструкции в разделе "Переменные окружения". Убедитесь, что все значения из `.env.example` перенесены в ваш `.env` и заполнены.

### Эндпоинты для фото:

-   `POST /api/users/me/avatar` — загрузить/заменить аватар (multipart/form-data, поле avatar)
-   `DELETE /api/users/me/avatar` — удалить аватар
-   `POST /api/ads/:id/photos` — загрузить фото для объявления (до 6, поле photos[])
-   `DELETE /api/ads/:id/photos/:photoKey` — удалить фото объявления

**Ограничения:**

-   Максимум 6 фото на объявление
-   Размер файла до 5 МБ
-   Только изображения (webp/png/jpg)
-   Оптимизация и конвертация в webp (sharp)

**Безопасность:**

-   Все ключи и секреты — только через .env
-   Проверка авторства при удалении фото
-   Валидация формата и размера

