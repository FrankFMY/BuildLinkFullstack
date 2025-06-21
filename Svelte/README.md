# Svelte — BuildLink Frontend

Клиентская часть BuildLink: современный UI на SvelteKit + TailwindCSS + TypeScript.

---

## Описание
Frontend реализует SPA-интерфейс для работы с объявлениями, регистрацией, авторизацией и поиском. Использует REST API backend-а, поддерживает все современные UX-паттерны.

## Архитектура
- SvelteKit (SSR + SPA)
- TypeScript, PostCSS, TailwindCSS
- Хранилище состояния (stores)
- E2E тесты (Playwright), unit-тесты
- Строгий ESLint, Prettier

## Основные возможности
- Регистрация, вход, выход (JWT)
- Просмотр, создание, редактирование, удаление объявлений
- Поиск и фильтрация
- Адаптивный дизайн, быстрый UI
- E2E тесты пользовательских сценариев

## Структура
- `src/routes/` — страницы (SvelteKit routing)
- `src/lib/components/` — UI-компоненты
- `src/lib/stores/` — глобальное состояние (auth и др.)
- `src/lib/utils/` — утилиты для API и прочего
- `static/` — статика (иконки, favicon)

## Стили
- TailwindCSS: utility-first, кастомизация через tailwind.config.ts
- PostCSS: автопрефиксы, вложенность

## Аутентификация
- JWT хранится в localStorage, автоматическое обновление состояния
- Защищённые маршруты (редактирование/удаление — только для авторов)

## Тестирование
- `npm run test` — E2E тесты (Playwright)
- `src/index.test.ts` — unit-тесты
- Сценарии: регистрация, логин, CRUD объявлений

## Запуск и сборка
```bash
npm install
npm run dev # http://localhost:5173
npm run build # production
npm run preview # локальный предпросмотр
```

## Советы по развитию
- Соблюдайте стиль (ESLint, Prettier)
- Все новые компоненты — с тестами
- Используйте stores для глобального состояния
- Не храните секреты в коде

## FAQ
- **Как добавить страницу?** — Создайте файл в `src/routes/`
- **Как подключить API?** — Используйте `lib/utils/api.ts`
- **Как добавить тест?** — В папку `tests/` или рядом с компонентом
- **Как изменить стили?** — В `tailwind.config.ts` и PostCSS

---

_Проект для демонстрации современных практик SvelteKit. Вопросы и баги — через Issues._
