# 📘 Платформа для координації міських благодій-них заходів із залученням волонтерів

> *Веб-платформа для координації благодійних подій, збору пожертв, публікації постів та взаємодії між організаціями та волонтерами.*

---

## 👤 Автор

* ПІБ: Лозинська Оксана Анатоліївна
* Група: ФЕС-42
* Керівник: Шувар Роман Ярославович, кандидат фізико-математичних наук, доцент.
* Дата виконання: \[12.04.2025]

---

## 📌 Загальна інформація

* Тип проєкту: Вебсайт (повноцінна платформа)
* Мова програмування: TypeScript
* Фреймворки / Бібліотеки: Next.js 15, React 18, TailwindCSS, tRPC, Drizzle ORM, Radix UI
* Інші сервіси: Checkout.com (оплата), HERE Maps API (геолокація), PostgreSQL (з PostGIS), Docker, Vercel

---

## 🧠 Опис функціоналу

* 🔐 Реєстрація та авторизація користувачів (NextAuth.js)
* 🏢 Створення організацій, подій і публікацій
* 🗺️ Інтерактивна карта подій (HERE Maps API)
* 💳 Прийом пожертв через Checkout.com
* 📊 Аналітика активностей
* 🔄 Безпечна обробка платежів через вебхуки
* 🐳 Повна Docker-інфраструктура для локального запуску

---

## 🧱 Опис основних класів / файлів

| Клас / Файл                   | Призначення                   |
| ----------------------------- | ----------------------------- |
| `src/pages/index.tsx`         | Головна сторінка платформи    |
| `src/server/api/trpc`         | Налаштування tRPC API         |
| `src/lib/checkout.ts`         | Інтеграція з Checkout.com API |
| `src/components/EventMap.tsx` | Інтерактивна мапа з подіями   |
| `drizzle.config.ts`           | Конфігурація Drizzle ORM      |

---

## ▶️ Як запустити проєкт "з нуля"

### 1. Встановлення інструментів

* Node.js v20+
* Docker + Docker Compose

### 2. Клонування репозиторію

```bash
git clone https://github.com/your-user/charity-platform.git
cd charity-platform
```

### 3. Створення `.env` файлу

На основі `.env.example`, додати ключі:

```env
DATABASE_URL=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
CHECKOUT_PUBLIC_KEY=...
CHECKOUT_SECRET_KEY=...
HERE_API_KEY=...
```

### 4. Запуск через Docker

```bash
docker-compose up --build
```

### 5. Результат

* Frontend: [http://localhost:3000](http://localhost:3000)
* PostgreSQL: `localhost:5432`

---

## 📦 Корисні скрипти

```bash
yarn run dev       # Запуск у dev-режимі
yarn run build     # Збірка для продакшену
yarn run db:push   # Синхронізація схеми бази даних
yarn run db:studio # Графічний інтерфейс для перегляду БД
```

---

## 🔌 API приклади

### 🔐 Авторизація

**api.user.signIn**

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  ...
}
```

---

### 🏢 Організації

**api.company.createCompany**

```json
{
  "company": {
    "name": "Благодійна організація",
    "companyEmail": "org@example.com",
    "description": "Допомога дітям",
    "website": "https://charity.org",
    "companyIBAN": "UA123456789012345678901234567890",
    "okpo": "12345678",
    "phoneNumber": "+380991234567",
    "firstName": "Оксана",
    "lastName": "Лозинська",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "country": "Україна"
  }
}
```

---

### 🗺️ Події

**api.event.createEvent**

```json
{
  "name": "Благодійний ярмарок",
  "purpose": "Збір коштів для дітей",
  "date": "2025-06-10T00:00:00.000Z",
  "locationName": "Львів, Площа Ринок",
  "locationId": "here:loc-id",
  "longitude": "24.031111",
  "latitude": "49.842957",
  "includeDonations": true,
  "companyId": "company_id",
  "category": "Ярмарок"
}
```

---

### 💳 Донати

**api.donation.initializePayment**

```json
{
  "amount": 500,
  "currency": "UAH",
  "eventId": "event_id",
  "anonymous": false
}
```

---

### 📝 Пости

**api.post.createPost**

```json
{
  "companyId": "company_id",
  "title": "Новий пост",
  "content": "Опис події або новини"
}
```

---

## 🖱️ Інструкція для користувача

1. Відкрити головну сторінку
2. Увійти або зареєструватися
3. Створити організацію або подію
4. Додати публікацію чи відстежити аналітику
5. Приймати платежі та перевіряти статус пожертв

---

## 📷 Приклади / скриншоти

* Головна сторінка з картою подій
* Форма створення події
* Аналітика пожертв

> *(Додайте зображення до папки `/screenshots/`)*

---

## 🧪 Проблеми і рішення

| Проблема                        | Рішення                                     |
| ------------------------------- | ------------------------------------------- |
| Події не відображаються на мапі | Перевірити HERE API ключ і формат координат |
| Checkout API не працює          | Перевірити валідність секретного ключа      |
| База даних не запускається      | Перевірити конфігурацію Docker Compose      |

---

## 🧾 Використані джерела / література

* [Next.js Documentation](https://nextjs.org/docs)
* [tRPC Docs](https://trpc.io/docs)
* [Drizzle ORM Docs](https://orm.drizzle.team/)
* [Checkout.com Docs](https://docs.checkout.com/)
* [HERE Maps API](https://developer.here.com/)
* StackOverflow

---

## Скріншоти

<img width="889" alt="Image" src="https://github.com/user-attachments/assets/28e6f53e-f050-426e-8cf4-a11fe44cf05e" />

<img width="892" alt="Image" src="https://github.com/user-attachments/assets/40c015d3-f9bb-4398-912b-f3989aeecdf2" />

<img width="897" alt="Image" src="https://github.com/user-attachments/assets/c1ac0871-0303-41ee-8f42-1fe642e34998" />

<img width="834" alt="Image" src="https://github.com/user-attachments/assets/fb1c8fc4-8277-4e4e-97bb-403083789d58" />
