import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { doctorSeedData, demoPatientSeed } from '../data/seedData.js';

const globalForSeed = globalThis;

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

export const ensureSeedData = async () => {
  if (globalForSeed.__mediconnectSeedPromise) {
    return globalForSeed.__mediconnectSeedPromise;
  }

  globalForSeed.__mediconnectSeedPromise = (async () => {
    const [doctorCount, demoPatient, demoDoctor] = await Promise.all([
      Doctor.estimatedDocumentCount(),
      User.findOne({ email: demoPatientSeed.email }).select('_id'),
      User.findOne({ email: doctorSeedData[0].email }).select('_id')
    ]);

    if (doctorCount >= doctorSeedData.length && demoPatient && demoDoctor) {
      console.log('[seed] runtime seed already present, skipping');
      return { seeded: false, reason: 'already present' };
    }

    const createdDoctors = [];

    for (const doctor of doctorSeedData) {
      const user = await User.findOneAndUpdate(
        { email: doctor.email },
        {
          $setOnInsert: {
            name: doctor.name,
            email: doctor.email,
            password: await bcrypt.hash(doctor.password, 10),
            role: 'doctor'
          }
        },
        { new: true, upsert: true }
      );

      let existingDoctor = await Doctor.findOne({ userId: user._id });
      if (!existingDoctor) {
        existingDoctor = await Doctor.findOne({
          name: doctor.name,
          specialization: doctor.specialization
        });
      }
      if (existingDoctor) {
        if (existingDoctor.userId.toString() !== user._id.toString()) {
          existingDoctor.userId = user._id;
          await existingDoctor.save();
        }
        createdDoctors.push(existingDoctor);
        continue;
      }

      const created = await Doctor.create({
        userId: user._id,
        name: doctor.name,
        specialization: doctor.specialization,
        experience: doctor.experience,
        fee: doctor.fee,
        ratings: doctor.ratings,
        about: doctor.about,
        availability: doctor.availability
      });
      createdDoctors.push(created);
    }

    const patient = await User.findOneAndUpdate(
      { email: demoPatientSeed.email },
      {
        $setOnInsert: {
          name: demoPatientSeed.name,
          email: demoPatientSeed.email,
          password: await bcrypt.hash(demoPatientSeed.password, 10),
          role: 'patient'
        }
      },
      { new: true, upsert: true }
    );

    const doctorDocs = await Doctor.find({
      userId: { $in: createdDoctors.map((doctor) => doctor.userId) }
    }).sort({ createdAt: 1 });

    const appointmentSamples = [
      {
        doctor: doctorDocs[0],
        slot: doctorDocs[0]?.availability?.[0]?.slots?.[0],
        dayOfWeek: doctorDocs[0]?.availability?.[0]?.dayOfWeek,
        status: 'scheduled',
        reason: 'Chest discomfort follow-up'
      },
      {
        doctor: doctorDocs[1],
        slot: doctorDocs[1]?.availability?.[1]?.slots?.[1],
        dayOfWeek: doctorDocs[1]?.availability?.[1]?.dayOfWeek,
        status: 'completed',
        reason: 'Skin allergy review'
      },
      {
        doctor: doctorDocs[2],
        slot: doctorDocs[2]?.availability?.[0]?.slots?.[0],
        dayOfWeek: doctorDocs[2]?.availability?.[0]?.dayOfWeek,
        status: 'cancelled',
        reason: 'Child fever consultation'
      }
    ].filter((item) => item.doctor && item.slot && item.dayOfWeek !== undefined);

    const existingAppointments = await Appointment.countDocuments();
    if (existingAppointments === 0) {
      for (const sample of appointmentSamples) {
        await Appointment.create({
          patientId: patient._id,
          doctorId: sample.doctor._id,
          appointmentDate: nextDateForDay(sample.dayOfWeek, 1),
          slotTime: sample.slot,
          confirmationEmail: demoPatientSeed.email,
          status: sample.status,
          reason: sample.reason
        });
      }
    }

    const totalDoctors = await Doctor.countDocuments();
    console.log('[seed] runtime seed completed', { doctors: totalDoctors });
    return { seeded: true, doctors: totalDoctors };
  })();

  try {
    return await globalForSeed.__mediconnectSeedPromise;
  } finally {
    globalForSeed.__mediconnectSeedPromise = null;
  }
};
