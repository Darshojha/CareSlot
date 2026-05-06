export const doctorSeedData = [
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

export const demoPatientSeed = {
  name: 'Demo Patient',
  email: 'patient@mediconnect.com',
  password: 'Password123!'
};
