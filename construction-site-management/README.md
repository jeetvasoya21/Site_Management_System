# Construction Site Management System

Full-stack construction management application with:
- `frontend`: React + Vite + Tailwind
- `backend`: Node.js + Express + PostgreSQL

## Repository Structure

```
construction-site-management/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── vite.config.js
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+

## Setup

1. Install dependencies for both apps:

```bash
npm run install:all
```

2. Configure environment variables:

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env` (optional)

3. Run development servers:

```bash
npm run dev
```

Default ports:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Root Scripts

- `npm run dev` - Run frontend and backend together
- `npm run dev:frontend` - Run only frontend
- `npm run dev:backend` - Run only backend
- `npm run start:frontend` - Start frontend
- `npm run start:backend` - Start backend
- `npm run install:all` - Install backend + frontend dependencies

## Database

Backend includes SQL helpers and seed scripts:
- `backend/siteos_enterprise_schema.sql`
- `backend/migrate_schema.sql`
- `backend/reset_db.sql`
- `backend/seed_data.js`

Use them according to your local PostgreSQL setup.

## GitHub Publishing Checklist

- `node_modules` removed
- build outputs (`dist`, `coverage`) removed
- `.env` files not committed
- only source, configs, and docs committed

This repository is now structured for direct GitHub publishing from this folder.
