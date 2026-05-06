import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

const parseDateKey = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const getDayIndex = (dateValue) => new Date(dateValue).getUTCDay();

export const getDoctors = async (req, res) => {
  const { search = '', specialization = '', availableDate = '' } = req.query;
  const filters = {};

  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } }
    ];
  }

  if (specialization) {
    filters.specialization = { $regex: specialization, $options: 'i' };
  }

  const doctors = await Doctor.find(filters).sort({ ratings: -1, createdAt: -1 });

  if (!availableDate) {
    return res.json(doctors);
  }

  if (!parseDateKey(availableDate)) {
    return res.status(400).json({ message: 'Invalid date' });
  }

  const dayIndex = getDayIndex(availableDate);
  const booked = await Appointment.find({
    appointmentDate: parseDateKey(availableDate),
    status: 'scheduled'
  }).select('doctorId slotTime');

  const bookedByDoctor = booked.reduce((acc, item) => {
    const key = item.doctorId.toString();
    if (!acc[key]) acc[key] = new Set();
    acc[key].add(item.slotTime);
    return acc;
  }, {});

  const availableDoctors = doctors.filter((doctor) => {
    const daySchedule = doctor.availability.find((item) => item.dayOfWeek === dayIndex);
    if (!daySchedule) return false;
    const taken = bookedByDoctor[doctor._id.toString()] || new Set();
    return daySchedule.slots.some((slot) => !taken.has(slot));
  });

  res.json(availableDoctors);
};

export const getDoctorById = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  res.json(doctor);
};

export const getDoctorSlots = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const availableDate = req.query.date;
  if (!availableDate) {
    return res.json(doctor.availability);
  }

  if (Number.isNaN(new Date(availableDate).getTime())) {
    return res.status(400).json({ message: 'Invalid date' });
  }

  const dayIndex = getDayIndex(availableDate);
  const daySchedule = doctor.availability.find((item) => item.dayOfWeek === dayIndex);
  const booked = await Appointment.find({
    doctorId: doctor._id,
    appointmentDate: parseDateKey(availableDate),
    status: 'scheduled'
  }).select('slotTime');

  const takenSlots = new Set(booked.map((appointment) => appointment.slotTime));
  const openSlots = daySchedule ? daySchedule.slots.filter((slot) => !takenSlots.has(slot)) : [];

  res.json({
    doctorId: doctor._id,
    date: availableDate,
    slots: openSlots,
    dayOfWeek: dayIndex
  });
};

export const updateDoctorSlots = async (req, res) => {
  const doctorId = req.params.id;
  const { availability } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const ownedDoctor = await Doctor.findOne({ userId: req.user._id });
  if (!ownedDoctor || ownedDoctor._id.toString() !== doctor._id.toString()) {
    return res.status(403).json({ message: 'You can only manage your own availability' });
  }

  if (!Array.isArray(availability)) {
    return res.status(400).json({ message: 'Availability must be an array' });
  }

  const normalized = availability
    .map((item) => ({
      dayOfWeek: Number(item.dayOfWeek),
      slots: Array.isArray(item.slots)
        ? item.slots.map((slot) => String(slot).trim()).filter(Boolean)
        : []
    }))
    .filter((item) => Number.isInteger(item.dayOfWeek) && item.dayOfWeek >= 0 && item.dayOfWeek <= 6);

  doctor.availability = normalized;

  await doctor.save();
  res.json(doctor);
};
