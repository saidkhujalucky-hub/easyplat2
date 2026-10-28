# Easy Plast

Исходный код сайта Easy Plast: тёмная тема, каталог упаковки, свои размеры во всех категориях, вращаемые 3D-модели, русский / узбекский / английский, заявка с расчётом стоимости, доставка с Google Картами, Google-вход и история заказов.

Стек: React 19, TypeScript, Vinext / Vite, Three.js, Cloudflare Workers + D1, Drizzle, Google Identity Services.

Это самостоятельная копия для вашего репозитория. Привязки к опубликованному сайту ChatGPT и реальные данные заказчиков в архив не включены.

## Загрузить на GitHub

1. Распакуйте ZIP.
2. Создайте пустой репозиторий на GitHub.
3. Загрузите **содержимое** папки `EASY_PLAST_50_FILES`, включая `.gitignore` и файлы конфигурации.

Через Git из этой папки:

```bash
git init
git add .
git commit -m "Add Easy Plast website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/easy-plast.git
git push -u origin main
```

Замените `YOUR_USERNAME` на своё имя GitHub, а URL — на адрес созданного репозитория.

GitHub хранит исходники. Для работающих входа и заказов требуется серверная часть; GitHub Pages не запускает Cloudflare Worker и базу D1. Ниже — настройка отдельного размещения в Cloudflare.

## Локальный запуск

Нужны Node.js **24+** и pnpm **11.25.0**. Команды выполняются из папки проекта.

```bash
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm db:migrate:local
pnpm dev
```

Откройте `http://127.0.0.1:5173`. Локальная база создаётся в `.wrangler/state`; для просмотра каталога и подготовки заявки подключение к аккаунту Cloudflare не требуется. В `wrangler.jsonc` оставлен фиктивный ID базы для локального запуска — перед публикацией его нужно заменить.

Без настройки Google сайт позволяет собрать заявку и открыть подготовленный текст в Telegram. Само сообщение отправляет клиент. Сохранение в личном кабинете требует настоящего Google-входа.

## Подключить Cloudflare D1

```bash
pnpm exec wrangler login
pnpm exec wrangler d1 create easy-plast-db
```

Вставьте полученный `database_id` в `wrangler.jsonc`, сохранив имя привязки `DB`. Если изменили название базы, также обновите `database_name`.

Примените схему к своей удалённой базе:

```bash
pnpm db:migrate:remote
```

Миграция в `drizzle/` создаёт пользователей, сеансы и заявки. В архиве есть структура базы, но нет существующих аккаунтов и заказов. Локальная и удалённая базы независимы.

## Опубликовать сайт

После создания базы и применения миграции:

```bash
pnpm build
pnpm deploy
```

Команда публикации выведет адрес вашего Worker. Публикация использует ваш аккаунт Cloudflare; оригинальный сайт Easy Plast не изменяется. Для своего домена настройте Custom Domain в Cloudflare.

## Подключить Google-вход

1. В Google Cloud → Google Auth Platform создайте OAuth-клиент типа **Web application**.
2. В **Authorized JavaScript origins** добавьте точный HTTPS-адрес опубликованного сайта без пути. Для локальной проверки добавьте `http://127.0.0.1:5173` и/или `http://localhost:5173`, в зависимости от используемого адреса.
3. Для локального запуска скопируйте `.dev.vars.example` в `.dev.vars` и укажите `GOOGLE_CLIENT_ID`.
4. Для опубликованного сайта добавьте значение:

```bash
pnpm exec wrangler secret put GOOGLE_CLIENT_ID --config dist/server/wrangler.json
```

Вставьте Client ID в интерактивном запросе. При следующей публикации проверьте, что переменная сохранена. **Client Secret не требуется:** используется Google Identity Services с проверкой ID-токена на сервере.

Если Google-приложение в режиме Testing, добавьте разрешённые тестовые аккаунты. Для публичного использования настройте его аудиторию в Google Auth Platform. В production используйте HTTPS: сеансы защищены cookie с `Secure`, `HttpOnly`, `SameSite=Lax`.

`.dev.vars`, `.env` и ключи игнорируются Git. Их реальные значения не нужно добавлять в репозиторий.

## Что где менять

| Файл | Содержимое |
| --- | --- |
| `app/catalog.ts` | Категории, рекомендуемые размеры, цвета, цены и минимум заказа |
| `app/EasyPlast.tsx` | Основные экраны, конфигуратор, корзина и доставка |
| `app/PackagingDetails.tsx` | 3D-витрина, выбор размера, схема замеров и FAQ |
| `app/Product3D.tsx` | Управление 3D-просмотром |
| `app/packaging-scene.ts` | Геометрия моделей и сцена Three.js |
| `app/canvas-renderer.ts` | Запасная объёмная отрисовка без WebGL |
| `app/messages.ts`, `app/detail-messages.ts` | Переводы RU / UZ / EN |
| `app/globals.css`, `app/details.css` | Оформление и мобильная адаптация |
| `app/api/auth/`, `app/verify-google.ts`, `app/auth.ts` | Google-вход и серверные сеансы |
| `app/api/orders/route.ts` | Сохранение заявок и серверная проверка цен |
| `app/order-validation.ts` | Проверка размеров, назначения упаковки и доставки |
| `db/`, `drizzle/` | Модель базы и миграции |
| `wrangler.jsonc` | Настройки Cloudflare и привязка базы |

Контакты заданы в интерфейсе: `+998 99 870 53 00`, `+998 90 987 53 00`, `https://t.me/easyplast`.

Тарифы: брокколи **29 000 сум/кг**, ковры **25 000 сум/кг**, остальные варианты **26 000 сум/кг**. Минимум — **20 кг суммарно**. Доставка и печать согласуются отдельно.

## Проверка

```bash
pnpm typecheck
pnpm test
pnpm build
```

Для просмотра production-сборки локально:

```bash
pnpm start
```

В проекте 26 тестов: проверка Google-токенов и сеансов, изоляция заказов, повторная отправка заявки, минимальный вес, тарифы, индивидуальные параметры и переводы текста заказа.

## Документация

- [Vinext](https://github.com/cloudflare/vinext)
- [Cloudflare D1 и миграции](https://developers.cloudflare.com/d1/reference/migrations/)
- [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- [Google Identity Services](https://developers.google.com/identity/gsi/web/guides/overview)
