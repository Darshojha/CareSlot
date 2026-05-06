# MediConnect

MediConnect is a full-stack healthcare appointment booking system built with the MERN stack.

## What is included

- Patient registration and login
- Doctor login with seeded demo accounts
- JWT-protected routes
- Doctor search, filters, and profiles
- Appointment booking, rescheduling, cancellation, and status updates
- Patient and doctor dashboards
- Doctor availability management
- Seed data for quick demo setup

## Tech Stack

- Frontend: React, Tailwind CSS, Framer Motion, React Router, Axios, React Icons, Toastify
- Backend: Node.js, Express.js, MongoDB Atlas, JWT, bcrypt

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add environment files:

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`

3. Configure `backend/.env` with your MongoDB Atlas URI and JWT secret.

4. Seed the database:

```bash
npm run seed
```

5. Start development:

```bash
npm run dev
```

## Demo Accounts

- Patient: `patient@mediconnect.com` / `Password123!`
- Doctor: `aanya@mediconnect.com` / `Password123!`

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/doctors`
- `GET /api/doctors/:id`
- `GET /api/doctors/:id/slots`
- `PATCH /api/doctors/:id/slots`
- `POST /api/appointments`
- `GET /api/appointments/me`
- `PATCH /api/appointments/:id`
- `DELETE /api/appointments/:id`

## Deployment

This repo is configured for Vercel deployment from the root.

Set these environment variables in Vercel:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `VITE_API_BASE_URL=/api`

The deployment config is in `vercel.json`. The frontend builds to `frontend/dist`, and the API is served from `api/[...path].js`.
