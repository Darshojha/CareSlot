# MediConnect PRD

## Product Summary

MediConnect is a healthcare appointment booking system for patients and doctors. It replaces phone-based scheduling with a simple web app where patients search doctors, book appointments, reschedule or cancel visits, and track appointment status. Doctors manage availability and update appointment outcomes from a dashboard.

## Problem Statement

Patients often spend time calling clinics to find doctors, confirm availability, and manage bookings. Clinics also need a lightweight system for handling appointments without enterprise complexity.

## Goals

- Let patients register, log in, search doctors, and book appointments online
- Let doctors log in, manage availability, and update appointment status
- Prevent double booking for the same doctor, date, and slot
- Keep the UI minimal, responsive, and easy to understand
- Provide seed data so the app is usable immediately after setup

## Target Users

### Patient

- Wants to find a doctor by specialty or name
- Needs to view availability quickly
- Wants to manage upcoming appointments and history

### Doctor

- Wants to see booked appointments
- Needs to control available slots
- Wants to complete or cancel bookings from one dashboard

## Core Features

### Authentication

- Patient registration
- Patient and doctor login
- JWT authentication
- Protected routes
- Password hashing with bcrypt

### Doctor Module

- View all doctors
- Search doctors
- Filter doctors by specialization and availability
- View doctor profile details
- View available slots for a selected date

### Appointment Module

- Book an available slot
- Prevent double booking
- View upcoming appointments
- Cancel appointments
- Reschedule appointments
- Track appointment status

### Patient Dashboard

- View upcoming appointments
- View reminders
- View appointment history
- Cancel or reschedule bookings

### Doctor Dashboard

- View booked appointments
- Update appointment status
- Manage weekly availability

### Notifications

- Appointment confirmation feedback
- Dashboard reminders for upcoming visits

## Out of Scope

- Payments
- Video consultations
- Prescription management
- Insurance processing
- Complex admin analytics

## Functional Requirements

- Registration should create patient accounts only
- Doctor accounts should be seedable for demo use
- Appointment dates should be stored at the day level with a slot time
- A slot can only be booked once for the same doctor and date
- Doctors can only manage their own availability
- Patients can only manage their own appointments

## Data Model

### Users

- `name`
- `email`
- `password`
- `role`

### Doctors

- `name`
- `specialization`
- `experience`
- `availability`
- `fee`
- `ratings`
- `about`

### Appointments

- `patientId`
- `doctorId`
- `appointmentDate`
- `slotTime`
- `status`

## API Summary

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

## Success Criteria

- A patient can sign up, log in, book a doctor, reschedule, and cancel successfully
- A doctor can log in, see their appointments, update status, and edit availability
- Seed data creates enough records to demonstrate the product immediately
- The app builds and deploys cleanly on Vercel

## Implementation Notes

- Frontend: React, Tailwind CSS, Framer Motion, React Router, Axios, React Icons, Toastify
- Backend: Node.js, Express.js, MongoDB Atlas, JWT, bcrypt
- Deployment: Vercel single-project setup with a serverless API function and frontend build output
