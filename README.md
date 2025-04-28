# 🏙️ Charity Coordination Platform

This project is a web platform for organizations and volunteers, enabling the creation of events, publishing of posts, coordination of activities, and collection of donations through integration with Checkout.com.

---

## ⚙️ Technology Stack

- **Frontend**: [Next.js 15](https://nextjs.org/), [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/)
- **API Layer**: [tRPC](https://trpc.io/) (End-to-end type-safe APIs)
- **Authentication**: [NextAuth.js (Auth.js)](https://authjs.dev/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [PostGIS](https://postgis.net/) extension for geolocation support
- **Payments**: [Checkout.com](https://www.checkout.com/) (payment processing, webhook handling)
- **Geolocation API**: [HERE Maps API](https://developer.here.com/)
- **Containerization**: [Docker](https://www.docker.com/)
- **Hosting**: [Vercel](https://vercel.com/) (for production frontend hosting)

---

## 🚀 Running Locally with Docker

1. **Clone the repository**
2. **Create a `.env` file** based on `.env.example`

Make sure to set the following variables:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- CHECKOUT_PUBLIC_KEY
- CHECKOUT_SECRET_KEY
- HERE_API_KEY

3. **Start the Docker containers**

```bash
docker-compose up --build
```

> This will spin up the backend, frontend, and a PostgreSQL database with the required configuration.

4. **Done!**
- Frontend will be available at: [http://localhost:3000](http://localhost:3000)
- PostgreSQL will be available at: `localhost:5432`

---

## 📦 Useful Project Scripts

- `yarn run dev` — start the development server
- `yarn run build` — build the project for production
- `yarn run db:push` — synchronize database schema
- `yarn run db:studio` — open Drizzle Studio GUI for inspecting the database

---

## 🧩 Key Features

- User registration and authentication
- Creation of organizations, events, and posts
- Interactive event map
- Donation acceptance via Checkout.com
- Activity analytics
- Secure payment handling through webhooks
- Full Docker-based deployment for easy setup

---
