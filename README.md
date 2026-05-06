# MediConnect

MediConnect is a full-stack healthcare appointment booking system built with the MERN stack.

This repository originated from the `CareSlot` project name on GitHub.

## Stack

- Frontend: React.js, Tailwind CSS, Framer Motion, React Router, Axios, React Icons, Toastify
- Backend: Node.js, Express.js, MongoDB Atlas, JWT, bcrypt

## Features

- Patient registration and login
- Doctor login with seeded demo accounts
- JWT-based protected routes
- Doctor search and filtering
- Doctor profile pages with availability and booking
- Appointment booking, rescheduling, cancellation, and status updates
- Patient dashboard and doctor dashboard
- Availability management for doctors
- Seed data for quick setup

## Project Structure

- `backend` - Express API, models, controllers, routes, seed script
- `frontend` - React app with Tailwind UI and dashboards

## Setup

1. Install dependencies from the repo root:

```bash
npm install
```

2. Create environment files:

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`

3. Set your MongoDB Atlas connection string in `backend/.env`.

4. Seed the database:

```bash
npm run seed
```

5. Start both apps:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:5000`.

## Demo Accounts

Patient:

- Email: `patient@mediconnect.com`
- Password: `Password123!`

Doctor:

- Email: `aanya@mediconnect.com`
- Password: `Password123!`

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Doctors

- `GET /api/doctors`
- `GET /api/doctors/:id`
- `GET /api/doctors/:id/slots`
- `PATCH /api/doctors/:id/slots`

### Appointments

- `POST /api/appointments`
- `GET /api/appointments/me`
- `PATCH /api/appointments/:id`
- `DELETE /api/appointments/:id` (soft-cancels the appointment)

## Notes

- Registration is for patients.
- Doctor accounts are seeded and can log in directly.
- Appointment conflict checks prevent double booking for the same doctor, date, and slot.

## Vercel Deployment

This repo is configured for a single Vercel deployment from the project root.

Set these environment variables in Vercel:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL` set to your Vercel domain, or leave it broad if you use preview deployments
- `VITE_API_BASE_URL=/api`

The deployment config is in `vercel.json`. The frontend builds to `frontend/dist`, and the API is served from the `api` folder.

Before going live, run the seed script against your Atlas database so the doctor profiles and demo appointments are present:

```bash
npm run seed
```
