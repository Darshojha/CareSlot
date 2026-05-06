import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { doctorSeedData, findSeedDoctorById, getSeedDoctorId, seedDoctorRecords } from '../data/seedData.js';

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());

const parseDateKey = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const getDayIndex = (dateValue) => new Date(dateValue).getUTCDay();

const canUseSlot = async ({ doctorId, appointmentDate, slotTime, excludeId = null }) => {
  const doctor = await Doctor.findById(doctorId);
  const seedDoctor = doctor || findSeedDoctorById(doctorId);
  if (!seedDoctor) return { ok: false, message: 'Doctor not found' };

  const resolvedDoctor = doctor || seedDoctor;

  const schedule = resolvedDoctor.availability.find((item) => item.dayOfWeek === getDayIndex(appointmentDate));
  if (!schedule || !schedule.slots.includes(slotTime)) {
    return { ok: false, message: 'Selected slot is not available for this date' };
  }

  const query = {
    doctorId,
    appointmentDate: parseDateKey(appointmentDate),
    slotTime,
    status: 'scheduled'
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const conflict = await Appointment.findOne(query);
  if (conflict) {
    return { ok: false, message: 'This slot is already booked' };
  }

  return { ok: true, doctor: resolvedDoctor };
};

const ensureSeedDoctorRecord = async (doctorId) => {
  const seedDoctor = findSeedDoctorById(doctorId);
  if (!seedDoctor) {
    return null;
  }

  const baseSeed = doctorSeedData.find((doctor) => getSeedDoctorId(doctor.email) === String(doctorId));
  const email = baseSeed?.email;
  if (!email) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(baseSeed.password, 10);
  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: baseSeed.name,
        email,
        password: hashedPassword,
        role: 'doctor'
      }
    },
    { new: true, upsert: true }
  );

  const doctor = await Doctor.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        userId: user._id,
        name: baseSeed.name,
        specialization: baseSeed.specialization,
        experience: baseSeed.experience,
        fee: baseSeed.fee,
        ratings: baseSeed.ratings,
        about: baseSeed.about,
        availability: baseSeed.availability
      }
    },
    { new: true, upsert: true }
  );

  return doctor;
};

const buildEmailPreview = (appointment) => {
  const appointmentDate = new Date(appointment.appointmentDate);
  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(appointmentDate);
  const doctorName = appointment.doctorId?.name || 'Doctor';
  const patientName = appointment.patientId?.name || 'Patient';
  const subject = `MediConnect appointment confirmation with ${doctorName}`;
  const body = [
    `Hello ${patientName},`,
    '',
    'Your appointment has been confirmed.',
    `Doctor: ${doctorName}`,
    `Specialization: ${appointment.doctorId?.specialization || 'N/A'}`,
    `Date: ${formattedDate}`,
    `Time: ${appointment.slotTime}`,
    `Status: ${appointment.status}`,
    `Reason: ${appointment.reason || 'Not provided'}`,
    '',
    'Please arrive a few minutes early.'
  ].join('\n');

  return {
    to: appointment.confirmationEmail,
    subject,
    body
  };
};

export const createAppointment = async (req, res) => {
  const { doctorId, appointmentDate, slotTime, reason = '', confirmationEmail = '' } = req.body;

  if (!doctorId || !appointmentDate || !slotTime || !confirmationEmail) {
    return res.status(400).json({ message: 'doctorId, appointmentDate, slotTime and confirmationEmail are required' });
  }

  if (!parseDateKey(appointmentDate)) {
    return res.status(400).json({ message: 'Invalid appointment date' });
  }

  if (!isEmail(confirmationEmail)) {
    return res.status(400).json({ message: 'Please provide a valid confirmation email address' });
  }

  let resolvedDoctorId = doctorId;
  const existingDoctor = await Doctor.findById(doctorId);
  if (!existingDoctor) {
    const ensuredDoctor = await ensureSeedDoctorRecord(doctorId);
    if (ensuredDoctor) {
      resolvedDoctorId = ensuredDoctor._id;
    }
  }

  let check = await canUseSlot({ doctorId: resolvedDoctorId, appointmentDate, slotTime });
  if (!check.ok && resolvedDoctorId !== doctorId) {
    check = await canUseSlot({ doctorId: doctorId, appointmentDate, slotTime });
  }
  if (!check.ok) {
    return res.status(400).json({ message: check.message });
  }

  const appointment = await Appointment.create({
    patientId: req.user._id,
    doctorId: resolvedDoctorId,
    appointmentDate: parseDateKey(appointmentDate),
    slotTime,
    confirmationEmail: confirmationEmail.toLowerCase(),
    reason,
    status: 'scheduled'
  });

  const populated = await appointment.populate([
    { path: 'patientId', select: 'name email role' },
    { path: 'doctorId', select: 'name specialization experience fee ratings about availability' }
  ]);

  const response = populated.toObject();
  response.emailPreview = buildEmailPreview(response);

  res.status(201).json(response);
};

export const getMyAppointments = async (req, res) => {
  if (req.user.role === 'doctor') {
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      return res.json([]);
    }
    const appointments = await Appointment.find({ doctorId: doctorProfile._id })
      .populate('patientId', 'name email role')
      .populate('doctorId', 'name specialization experience fee ratings about availability')
      .sort({ appointmentDate: 1, slotTime: 1 });

    return res.json(
      appointments.map((appointment) => {
        const item = appointment.toObject();
        if (!item.doctorId || typeof item.doctorId === 'string') {
          item.doctorId = seedDoctorRecords.find((doctor) => doctor._id === String(appointment.doctorId)) || item.doctorId;
        }
        return item;
      })
    );
  }

  const appointments = await Appointment.find({ patientId: req.user._id })
    .populate('patientId', 'name email role')
    .populate('doctorId', 'name specialization experience fee ratings about availability')
    .sort({ appointmentDate: 1, slotTime: 1 });

  res.json(
    appointments.map((appointment) => {
      const item = appointment.toObject();
      if (!item.doctorId || typeof item.doctorId === 'string') {
        item.doctorId = seedDoctorRecords.find((doctor) => doctor._id === String(appointment.doctorId)) || item.doctorId;
      }
      return item;
    })
  );
};

export const updateAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const doctorProfile = req.user.role === 'doctor' ? await Doctor.findOne({ userId: req.user._id }) : null;
  const isPatientOwner = appointment.patientId.toString() === req.user._id.toString();
  const isDoctorOwner = doctorProfile && appointment.doctorId.toString() === doctorProfile._id.toString();

  if (!isPatientOwner && !isDoctorOwner) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { status, appointmentDate, slotTime, reason } = req.body;

  if (status && ['scheduled', 'completed', 'cancelled'].includes(status)) {
    if (req.user.role === 'doctor' || (req.user.role === 'patient' && status === 'cancelled')) {
      appointment.status = status;
    } else {
      return res.status(403).json({ message: 'You cannot set this status' });
    }
  }

  if (appointmentDate || slotTime) {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can reschedule appointments' });
    }

    if (appointmentDate && !parseDateKey(appointmentDate)) {
      return res.status(400).json({ message: 'Invalid appointment date' });
    }

    const nextDate = appointmentDate ? parseDateKey(appointmentDate) : appointment.appointmentDate;
    const nextSlot = slotTime || appointment.slotTime;
    const check = await canUseSlot({
      doctorId: appointment.doctorId,
      appointmentDate: nextDate,
      slotTime: nextSlot,
      excludeId: appointment._id
    });

    if (!check.ok) {
      return res.status(400).json({ message: check.message });
    }

    appointment.appointmentDate = nextDate;
    appointment.slotTime = nextSlot;
    appointment.status = 'scheduled';
  }

  if (typeof reason === 'string') {
    appointment.reason = reason;
  }

  await appointment.save();
  const populated = await appointment.populate([
    { path: 'patientId', select: 'name email role' },
    { path: 'doctorId', select: 'name specialization experience fee ratings about availability' }
  ]);

  res.json(populated);
};

export const cancelAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const doctorProfile = req.user.role === 'doctor' ? await Doctor.findOne({ userId: req.user._id }) : null;
  const isPatientOwner = appointment.patientId.toString() === req.user._id.toString();
  const isDoctorOwner = doctorProfile && appointment.doctorId.toString() === doctorProfile._id.toString();

  if (!isPatientOwner && !isDoctorOwner) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  appointment.status = 'cancelled';
  await appointment.save();

  res.json({ message: 'Appointment cancelled' });
};
