import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import { signToken } from '../utils/jwt.js';
import { demoPatientSeed, doctorSeedData } from '../data/seedData.js';

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());

const createTokenResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: signToken({ id: user._id, role: user.role })
});

const ensureSeedUser = async (seedUser, role, doctorSeed = null) => {
  const hashedPassword = await bcrypt.hash(seedUser.password, 10);
  const user = await User.findOneAndUpdate(
    { email: seedUser.email.toLowerCase() },
    {
      $set: {
        name: seedUser.name,
        email: seedUser.email.toLowerCase(),
        password: hashedPassword,
        role
      }
    },
    { new: true, upsert: true }
  );

  if (role === 'doctor' && doctorSeed) {
    await Doctor.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          userId: user._id,
          name: doctorSeed.name,
          specialization: doctorSeed.specialization,
          experience: doctorSeed.experience,
          fee: doctorSeed.fee,
          ratings: doctorSeed.ratings,
          about: doctorSeed.about,
          availability: doctorSeed.availability
        }
      },
      { new: true, upsert: true }
    );
  }

  return user;
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  if (!isEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'patient'
  });

  res.status(201).json(createTokenResponse(user));
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!isEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  const normalizedEmail = email.toLowerCase();
  let user = await User.findOne({ email: normalizedEmail });

  if (!user && normalizedEmail === demoPatientSeed.email) {
    user = await ensureSeedUser(demoPatientSeed, 'patient');
  }

  if (!user) {
    const seedDoctor = doctorSeedData.find((doctor) => doctor.email.toLowerCase() === normalizedEmail);
    if (seedDoctor) {
      user = await ensureSeedUser(seedDoctor, 'doctor', seedDoctor);
    }
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const seedDoctor = doctorSeedData.find((doctor) => doctor.email.toLowerCase() === normalizedEmail);
    const seedPatient = normalizedEmail === demoPatientSeed.email ? demoPatientSeed : null;

    if (seedDoctor || seedPatient) {
      user = await ensureSeedUser(seedDoctor || seedPatient, seedDoctor ? 'doctor' : 'patient', seedDoctor || null);
      const retryMatch = await bcrypt.compare(password, user.password);
      if (!retryMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const retryPayload = createTokenResponse(user);
      if (user.role === 'doctor') {
        const doctorProfile = await Doctor.findOne({ userId: user._id });
        retryPayload.doctorId = doctorProfile?._id || null;
      }
      return res.json(retryPayload);
    }
  }

  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const payload = createTokenResponse(user);

  if (user.role === 'doctor') {
    const doctorProfile = await Doctor.findOne({ userId: user._id });
    payload.doctorId = doctorProfile?._id || null;
  }

  res.json(payload);
};

export const me = async (req, res) => {
  const payload = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  };

  if (req.user.role === 'doctor') {
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    payload.doctorId = doctorProfile?._id || null;
  }

  res.json(payload);
};
