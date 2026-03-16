# Foodio | Premium Restaurant Ordering System

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)

## Project Overview

Foodio is a modern, premium restaurant ordering system designed to provide a "butter-smooth" user experience for customers and a robust management interface for administrators. It facilitates seamless browsing of menu items, managing shopping carts, and processing orders in real-time. 

The application solves the problem of clunky, outdated restaurant ordering interfaces by offering a heavily optimized, responsive frontend paired with a high-performance backend, ensuring quick load times, real-time inventory updates, and reliable order processing.

## Architecture & Tech Stack

This project is built as a modular monorepo, separating the client-side interface and the server API.

### Frontend
* **[Next.js](https://nextjs.org/) (v16.1.6 with Turbopack)**: The core React framework used for server-side rendering, routing, and providing a highly optimized user experience.
* **[React 19](https://react.dev/)**: Used for building encapsulated, reusable UI components.
* **[Tailwind CSS](https://tailwindcss.com/) (v4)**: A utility-first CSS framework used for rapid, responsive UI development.
* **[Zustand](https://zustand-demo.pmnd.rs/)**: A small, fast, and scalable bearbones state-management solution used for client-side state (e.g., cart management).

### Backend
* **[NestJS](https://nestjs.com/) (v11)**: A progressive Node.js framework used for building an efficient, reliable, and scalable server-side application. It enforces a clean, heavily-typed enterprise architecture.
* **[PostgreSQL](https://www.postgresql.org/)**: The primary relational database used to store users, categories, menu items, and orders.
* **[Prisma ORM](https://www.prisma.io/)**: Next-generation Node.js and TypeScript ORM used for strictly-typed database access and schema migrations.
* **[Redis](https://redis.io/) (via Upstash / ioredis)**: An in-memory data structure store, used as a database, cache, and message broker to optimize highly-requested endpoints (like menu items).
* **[Cloudinary](https://cloudinary.com/)**: Used for cloud-based image management and optimization for menu item pictures.

## Prerequisites

To run this project locally, ensure you have the following installed:

* **Node.js** (v20+ recommended)
* **npm** (v10+ recommended)
* **PostgreSQL Database** (e.g., via [Render](https://render.com/))
* **Redis Instance** (e.g., via [Upstash](https://upstash.com/))

## Local Environment Setup & Running the System

Follow these step-by-step instructions to get the application running on your local machine.

### 1. Clone the repository
```bash
git clone [ Repository URL]
cd Deepchain
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend` directory and a `.env.local` file in the `frontend` directory.

**Backend (`backend/.env`):**
| Variable | Description | Example / Placeholder |
|----------|-------------|-----------------------|
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Backend server port | `3000` |
| `DATABASE_HOST` | Database host | `localhost` |
| `DATABASE_USER` | Database username | `postgres` |
| `DATABASE_PASSWORD` | Database password | `your_secure_password` |
| `DATABASE_NAME` | Database name | `foodio_db` |
| `DATABASE_PORT` | Database exposed port | `5932` |
| `DATABASE_URL` | Full Prisma connection string | `postgresql://user:password@localhost:5932/foodio_db?schema=public` |
| `REDIS_PASSWORD` | Redis password (for Docker) | `your_redis_password` |
| `REDIS_PORT` | Redis exposed port (for Docker) | `6379` |
| `REDIS_URL` | Redis connection URL | `redis://:your_redis_password@localhost:6379` |
| `ACCESS_TOKEN_SECRET` | Secret for JWT access tokens | `your_access_secret` |
| `ACCESS_TOKEN_EXPIRY` | Access token lifespan | `10m` |
| `REFRESH_TOKEN_SECRET`| Secret for JWT refresh tokens | `your_refresh_secret` |
| `REFRESH_TOKEN_EXPIRY`| Refresh token lifespan | `7d` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret | `your_api_secret` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |

*Note: The `docker-compose.yml` uses these variables to boot the database and Redis containers.*

**Frontend (`frontend/.env.local`):**
| Variable | Description | Example / Placeholder |
|----------|-------------|-----------------------|
| `PORT` | Frontend server port | `3001` |
| `NEXT_PUBLIC_API_URL` | Base URL for the backend API | `http://localhost:4259/api/v1` |

### 3. Start Infrastructure (Postgres & Redis)

You have two options for the database and cache layer.

#### Option A: Local Docker (Recommended for Testing)
Ensure Docker is installed and running on your machine. Start the necessary services using Docker Compose from the root directory:
```bash
docker compose up -d
```
*This will spin up local instances of PostgreSQL and Redis. If you use this option, use the local URLs provided in the `.env` examples above.*

#### Option B: Connect to the Live Cloud Database
If you prefer to connect to the deployed PostgreSQL database (Render) and Redis instance (Upstash) to see the live data, update your `backend/.env` with the following connection strings instead of the local ones:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `[Provided Render connection string]` |
| `REDIS_URL` | `[Provided Upstash connection string]` |

*(Note to reviewers: Feel free to use either the `docker-compose` setup or the live credentials provided during the submission).*

### 4. Backend Setup & Seeding the Database
Install dependencies, synchronize your Prisma database schema, seed the initial database configuration, and start the development server.

Open a terminal and run:
```bash
cd backend
npm install

# Apply migrations and sync database schema (Skip if using Option B / Live DB)
npx prisma db push

# Seed the database with initial data (Skip if using Option B / Live DB)
npm run seed

# Start the NestJS backend API server
npm run start:dev
```
The backend API will be running at `http://localhost:4259` (or the port you defined in your `.env`).

### 5. Frontend Setup
In a separate terminal, install dependencies and start the Next.js frontend UI.
```bash
cd frontend
npm install

# Start the frontend Next.js server
npm run dev
```
The frontend will be available at `http://localhost:3000` (or `3001` based on your port configuration).

## Available Scripts

### Backend (`/backend`)
* `npm run start:dev`: Starts the NestJS server in watch mode for development.
* `npm run build`: Compiles the NestJS application into the `dist` folder.
* `npm run seed`: Executes `prisma/seed.ts` to populate the database.
* `npm run test`: Runs unit tests via Jest.
* `npm run lint`: Analyzes the code for ESLint errors and fixes them automatically.
* `npm run format`: Formats code using Prettier.

### Frontend (`/frontend`)
* `npm run dev`: Starts the Next.js development server (Turbopack enabled).
* `npm run build`: Creates an optimized production build.
* `npm run start`: Starts the application in production mode.
* `npm run lint`: Runs Next.js ESLint configuration.
* `npm run typecheck`: Runs the TypeScript compiler to check for type errors without emitting files.

## Project Structure

```text
Deepchain/
├── docker-compose.yml      # Infrastructure definitions (DB, Redis)
├── README.md               # Project documentation
├── backend/                # NestJS API
│   ├── prisma/             # Database schema, migrations, and seed scripts
│   │   ├── schema.prisma   # Prisma ORM schema
│   │   └── seed.ts         # Database seeder
│   └── src/                # Backend Source Code
│       ├── common/         # Global guards, filters, interceptors
│       ├── config/         # Configuration validation
│       ├── infrastructure/ # External services (Redis, Cloudinary)
│       ├── modules/        # Feature modules (Auth, Orders, MenuItems, etc.)
│       ├── app.module.ts   # Main application module
│       └── main.ts         # Application entry point
└── frontend/               # Next.js Application
    ├── next.config.ts      # Next.js configuration
    └── src/
        ├── app/            # App Router pages and layouts (e.g., /menu, /orders)
        ├── components/     # Reusable React components (UI, Layouts)
        ├── hooks/          # Custom React hooks
        ├── lib/            # Utility functions and API clients (axios)
        └── store/          # Zustand global state stores
```

## Contributing Guidelines

1. **Create a branch**: Branch off of `main` using the following naming convention: `feature/your-feature-name` or `fix/your-fix-name`.
   ```bash
   git checkout -b feature/awesome-new-feature
   ```
2. **Commit Standards**: Write clear, descriptive commit messages. Ensure all TypeScript tests and linters pass before committing.
3. **Open a PR**: Push your branch to the repository and open a Pull Request against the `main` branch. Provide a detailed description of your changes and tag relevant team members for review.

---

## Deployment

**Live Application:** [https://deep-chain-elxe.vercel.app/](https://deep-chain-elxe.vercel.app/)

The frontend is hosted on Vercel, integrating seamlessly with the Next.js ecosystem. The backend runs on a managed Node.js environment, with the database and cache utilizing Render PostgreSQL and Upstash Redis respectively.
