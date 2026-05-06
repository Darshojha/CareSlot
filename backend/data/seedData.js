import crypto from 'crypto';

const slotPool = [
  '08:30 AM',
  '09:30 AM',
  '10:30 AM',
  '11:30 AM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM'
];

const hashString = (value) =>
  String(value)
    .split('')
    .reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) >>> 0, 0);

const createRandom = (seed) => {
  let state = hashString(seed) || 1;
  return () => {
    state = (1664525 * state + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

const shuffle = (items, seed) => {
  const random = createRandom(seed);
  const values = [...items];
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return values;
};

const timeToMinutes = (value) => {
  const [time, modifier] = value.split(' ');
  const [rawHour, rawMinute] = time.split(':').map(Number);
  let hour = rawHour;
  if (modifier === 'PM' && hour !== 12) hour += 12;
  if (modifier === 'AM' && hour === 12) hour = 0;
  return hour * 60 + rawMinute;
};

const buildAvailability = (seed) => {
  const randomDays = shuffle([0, 1, 2, 3, 4, 5, 6], `${seed}:days`).slice(0, 3).sort((a, b) => a - b);
  const randomSlots = shuffle(slotPool, `${seed}:slots`);
  return randomDays.map((dayOfWeek, index) => ({
    dayOfWeek,
    slots: randomSlots
      .slice(index * 3, index * 3 + 3)
      .sort((left, right) => timeToMinutes(left) - timeToMinutes(right))
  }));
};

export const doctorSeedData = [
  {
    name: 'Dr. Aanya Sharma',
    email: 'aanya@mediconnect.com',
    password: 'Password123!',
    specialization: 'Cardiology',
    experience: 12,
    fee: 800,
    ratings: 4.9,
    about: 'Cardiologist focused on preventive care, hypertension, and long-term heart health.'
  },
  {
    name: 'Dr. Rahul Mehta',
    email: 'rahul@mediconnect.com',
    password: 'Password123!',
    specialization: 'Dermatology',
    experience: 9,
    fee: 650,
    ratings: 4.7,
    about: 'Dermatologist handling acne, skin allergies, pigmentation, and routine skin checkups.'
  },
  {
    name: 'Dr. Priya Nair',
    email: 'priya@mediconnect.com',
    password: 'Password123!',
    specialization: 'Pediatrics',
    experience: 11,
    fee: 700,
    ratings: 4.8,
    about: 'Pediatrician offering child wellness visits, vaccinations, and general consultations.'
  },
  {
    name: 'Dr. Vivek Iyer',
    email: 'vivek@mediconnect.com',
    password: 'Password123!',
    specialization: 'Orthopedics',
    experience: 14,
    fee: 900,
    ratings: 4.6,
    about: 'Orthopedic specialist for bone, joint, and sports injury consultations.'
  },
  {
    name: 'Dr. Neha Kapoor',
    email: 'neha@mediconnect.com',
    password: 'Password123!',
    specialization: 'Neurology',
    experience: 10,
    fee: 950,
    ratings: 4.8,
    about: 'Neurologist for migraines, seizures, nerve pain, and follow-up consultations.'
  },
  {
    name: 'Dr. Sanjay Verma',
    email: 'sanjay@mediconnect.com',
    password: 'Password123!',
    specialization: 'General Medicine',
    experience: 15,
    fee: 500,
    ratings: 4.5,
    about: 'General physician for first-contact care, common illnesses, and routine medical advice.'
  },
  {
    name: 'Dr. Farah Khan',
    email: 'farah@mediconnect.com',
    password: 'Password123!',
    specialization: 'ENT',
    experience: 8,
    fee: 720,
    ratings: 4.6,
    about: 'ENT specialist for ear, nose, throat concerns and basic procedure consultations.'
  }
].map((doctor) => ({
  ...doctor,
  availability: buildAvailability(`${doctor.email}:${doctor.specialization}`)
}));

export const getSeedDoctorId = (email) =>
  crypto.createHash('md5').update(String(email).toLowerCase()).digest('hex').slice(0, 24);

export const getSeedUserId = (email) => getSeedDoctorId(email);

export const toSeedDoctorRecord = (doctor) => ({
  _id: getSeedDoctorId(doctor.email),
  userId: getSeedDoctorId(doctor.email),
  name: doctor.name,
  specialization: doctor.specialization,
  experience: doctor.experience,
  fee: doctor.fee,
  ratings: doctor.ratings,
  about: doctor.about,
  availability: doctor.availability
});

export const seedDoctorRecords = doctorSeedData.map(toSeedDoctorRecord);

export const findSeedDoctorById = (id) => seedDoctorRecords.find((doctor) => doctor._id === String(id)) || null;

export const demoPatientSeed = {
  name: 'Demo Patient',
  email: 'patient@mediconnect.com',
  password: 'Password123!'
};
