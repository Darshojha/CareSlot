import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { connectDB } from '../config/db.js';

const doctors = [
  {
    name: 'Dr. Aanya Sharma',
    email: 'aanya@mediconnect.com',
    password: 'Password123!',
    specialization: 'Cardiology',
    experience: 12,
    fee: 800,
    ratings: 4.9,
    about: 'Cardiologist focused on preventive care, hypertension, and long-term heart health.',
    availability: [
      { dayOfWeek: 1, slots: ['09:00 AM', '10:00 AM', '11:30 AM'] },
      { dayOfWeek: 3, slots: ['02:00 PM', '03:00 PM', '04:00 PM'] },
      { dayOfWeek: 5, slots: ['10:00 AM', '11:00 AM', '12:00 PM'] }
    ]
  },
  {
    name: 'Dr. Rahul Mehta',
    email: 'rahul@mediconnect.com',
    password: 'Password123!',
    specialization: 'Dermatology',
    experience: 9,
    fee: 650,
    ratings: 4.7,
    about: 'Dermatologist handling acne, skin allergies, pigmentation, and routine skin checkups.',
    availability: [
      { dayOfWeek: 2, slots: ['10:00 AM', '11:00 AM', '01:00 PM'] },
      { dayOfWeek: 4, slots: ['09:30 AM', '10:30 AM', '03:00 PM'] },
      { dayOfWeek: 6, slots: ['11:00 AM', '12:00 PM', '01:30 PM'] }
    ]
  },
  {
    name: 'Dr. Priya Nair',
    email: 'priya@mediconnect.com',
    password: 'Password123!',
    specialization: 'Pediatrics',
    experience: 11,
    fee: 700,
    ratings: 4.8,
    about: 'Pediatrician offering child wellness visits, vaccinations, and general consultations.',
    availability: [
      { dayOfWeek: 1, slots: ['08:30 AM', '09:30 AM', '10:30 AM'] },
      { dayOfWeek: 4, slots: ['01:00 PM', '02:00 PM', '03:30 PM'] },
      { dayOfWeek: 6, slots: ['09:00 AM', '10:00 AM', '11:00 AM'] }
    ]
  },
  {
    name: 'Dr. Vivek Iyer',
    email: 'vivek@mediconnect.com',
    password: 'Password123!',
    specialization: 'Orthopedics',
    experience: 14,
    fee: 900,
    ratings: 4.6,
    about: 'Orthopedic specialist for bone, joint, and sports injury consultations.',
    availability: [
      { dayOfWeek: 0, slots: ['10:00 AM', '11:00 AM', '12:00 PM'] },
      { dayOfWeek: 2, slots: ['02:00 PM', '03:00 PM', '04:00 PM'] },
      { dayOfWeek: 5, slots: ['09:30 AM', '10:30 AM', '11:30 AM'] }
    ]
  },
  {
    name: 'Dr. Neha Kapoor',
    email: 'neha@mediconnect.com',
    password: 'Password123!',
    specialization: 'Neurology',
    experience: 10,
    fee: 950,
    ratings: 4.8,
    about: 'Neurologist for migraines, seizures, nerve pain, and follow-up consultations.',
    availability: [
      { dayOfWeek: 1, slots: ['11:00 AM', '12:00 PM', '03:00 PM'] },
      { dayOfWeek: 3, slots: ['09:00 AM', '10:30 AM', '01:30 PM'] },
      { dayOfWeek: 6, slots: ['10:00 AM', '11:30 AM', '02:00 PM'] }
    ]
  },
  {
    name: 'Dr. Sanjay Verma',
    email: 'sanjay@mediconnect.com',
    password: 'Password123!',
    specialization: 'General Medicine',
    experience: 15,
    fee: 500,
    ratings: 4.5,
    about: 'General physician for first-contact care, common illnesses, and routine medical advice.',
    availability: [
      { dayOfWeek: 0, slots: ['09:00 AM', '10:00 AM', '11:00 AM'] },
      { dayOfWeek: 2, slots: ['01:00 PM', '02:00 PM', '04:00 PM'] },
      { dayOfWeek: 4, slots: ['09:30 AM', '11:00 AM', '12:30 PM'] }
    ]
  },
  {
    name: 'Dr. Farah Khan',
    email: 'farah@mediconnect.com',
    password: 'Password123!',
    specialization: 'ENT',
    experience: 8,
    fee: 720,
    ratings: 4.6,
    about: 'ENT specialist for ear, nose, throat concerns and basic procedure consultations.',
    availability: [
      { dayOfWeek: 1, slots: ['08:30 AM', '09:30 AM', '01:00 PM'] },
      { dayOfWeek: 4, slots: ['10:00 AM', '11:00 AM', '02:00 PM'] },
      { dayOfWeek: 5, slots: ['09:00 AM', '12:00 PM', '03:00 PM'] }
    ]
  }
];

const nextDateForDay = (dayOfWeek, weeksAhead = 1) => {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const currentDay = date.getUTCDay();
  let delta = dayOfWeek - currentDay;
  if (delta <= 0) delta += 7;
  delta += 7 * weeksAhead;
  date.setUTCDate(date.getUTCDate() + delta);
  return date;
};

const run = async () => {
  await connectDB(process.env.MONGO_URI);

  await Appointment.deleteMany({});
  await Doctor.deleteMany({});
  await User.deleteMany({ role: 'doctor' });

  for (const doctor of doctors) {
    const user = await User.create({
      name: doctor.name,
      email: doctor.email,
      password: await bcrypt.hash(doctor.password, 10),
      role: 'doctor'
    });

    await Doctor.create({
      userId: user._id,
      name: doctor.name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      fee: doctor.fee,
      ratings: doctor.ratings,
      about: doctor.about,
      availability: doctor.availability
    });
  }

  const demoPatientEmail = 'patient@mediconnect.com';
  const existingPatient = await User.findOne({ email: demoPatientEmail });
  let demoPatient = existingPatient;
  if (!existingPatient) {
    demoPatient = await User.create({
      name: 'Demo Patient',
      email: demoPatientEmail,
      password: await bcrypt.hash('Password123!', 10),
      role: 'patient'
    });
  }

  const doctorDocs = await Doctor.find({}).sort({ createdAt: 1 });
  const appointmentSamples = [
    {
      doctor: doctorDocs[0],
      dayOfWeek: doctorDocs[0]?.availability?.[0]?.dayOfWeek,
      slotTime: doctorDocs[0]?.availability?.[0]?.slots?.[0],
      status: 'scheduled',
      reason: 'Chest discomfort follow-up'
    },
    {
      doctor: doctorDocs[1],
      dayOfWeek: doctorDocs[1]?.availability?.[1]?.dayOfWeek,
      slotTime: doctorDocs[1]?.availability?.[1]?.slots?.[1],
      status: 'completed',
      reason: 'Skin allergy review'
    },
    {
      doctor: doctorDocs[2],
      dayOfWeek: doctorDocs[2]?.availability?.[0]?.dayOfWeek,
      slotTime: doctorDocs[2]?.availability?.[0]?.slots?.[0],
      status: 'cancelled',
      reason: 'Child fever consultation'
    }
  ].filter((item) => item.doctor && item.slotTime !== undefined && item.dayOfWeek !== undefined);

  for (const sample of appointmentSamples) {
    const appointmentDate = nextDateForDay(sample.dayOfWeek, 1);
    await Appointment.create({
      patientId: demoPatient._id,
      doctorId: sample.doctor._id,
      appointmentDate,
      slotTime: sample.slotTime,
      status: sample.status,
      reason: sample.reason
    });
  }

  console.log('Seed completed');
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
