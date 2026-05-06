import Doctor from '../models/Doctor.js';
import { findSeedDoctorById, seedDoctorRecords } from '../data/seedData.js';

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
  const filteredDoctors = seedDoctorRecords
    .filter((doctor) => {
      const matchesSearch =
        !search ||
        doctor.name.toLowerCase().includes(search.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(search.toLowerCase());
      const matchesSpecialization =
        !specialization || doctor.specialization.toLowerCase().includes(specialization.toLowerCase());
      return matchesSearch && matchesSpecialization;
    })
    .sort((left, right) => right.ratings - left.ratings);

  console.log('[doctor api] returning', filteredDoctors.length, 'seed doctors');

  if (!availableDate) {
    return res.json(filteredDoctors);
  }

  if (!parseDateKey(availableDate)) {
    return res.status(400).json({ message: 'Invalid date' });
  }

  const dayIndex = getDayIndex(availableDate);
  const availableDoctors = filteredDoctors.filter((doctor) => {
    const daySchedule = doctor.availability.find((item) => item.dayOfWeek === dayIndex);
    if (!daySchedule) return false;
    return daySchedule.slots.length > 0;
  });

  res.json(availableDoctors);
};

export const getDoctorById = async (req, res) => {
  const seedDoctor = findSeedDoctorById(req.params.id);
  if (seedDoctor) {
    return res.json(seedDoctor);
  }

  const doctor = await Doctor.findById(req.params.id);
  if (doctor) {
    return res.json(doctor);
  }

  return res.status(404).json({ message: 'Doctor not found' });
};

export const getDoctorSlots = async (req, res) => {
  const seedDoctor = findSeedDoctorById(req.params.id);
  if (!seedDoctor) {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    return res.json({
      doctorId: doctor._id,
      date: req.query.date || '',
      slots: doctor.availability,
      dayOfWeek: Number(new Date(req.query.date || Date.now()).getUTCDay())
    });
  }

  const availableDate = req.query.date;
  if (!availableDate) {
    return res.json(seedDoctor.availability);
  }

  if (Number.isNaN(new Date(availableDate).getTime())) {
    return res.status(400).json({ message: 'Invalid date' });
  }

  const dayIndex = getDayIndex(availableDate);
  const daySchedule = seedDoctor.availability.find((item) => item.dayOfWeek === dayIndex);
  const openSlots = daySchedule ? daySchedule.slots : [];

  res.json({
    doctorId: seedDoctor._id,
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
