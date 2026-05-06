import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import { connectDB } from '../config/db.js';
import { signToken } from '../utils/jwt.js';
import { demoPatientSeed, doctorSeedData, getSeedUserId, getSeedDoctorId } from '../data/seedData.js';

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
      timer.unref?.();
    })
  ]);

const createTokenResponse = (user, overrides = {}) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  doctorId: (overrides.doctorId ?? user.doctorId) || null,
  token: signToken({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    doctorId: (overrides.doctorId ?? user.doctorId) || null
  })
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
  try {
    await withTimeout(connectDB(process.env.MONGO_URI), 5000, 'Mongo connect');

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

    const existing = await withTimeout(
      User.findOne({ email: email.toLowerCase() }),
      5000,
      'User lookup'
    );
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

    return res.status(201).json(createTokenResponse(user));
  } catch (error) {
    return res.status(503).json({ message: error.message || 'Registration temporarily unavailable' });
  }
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
  const demoPatientId = getSeedUserId(demoPatientSeed.email);
  const demoDoctor = doctorSeedData.find((doctor) => doctor.email.toLowerCase() === normalizedEmail);

  if (normalizedEmail === demoPatientSeed.email) {
    if (password !== demoPatientSeed.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json(
      createTokenResponse(
        {
          _id: demoPatientId,
          name: demoPatientSeed.name,
          email: demoPatientSeed.email,
          role: 'patient'
        },
        { doctorId: null }
      )
    );
  }

  if (demoDoctor) {
    if (password !== demoDoctor.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const doctorId = getSeedDoctorId(demoDoctor.email);
    return res.json(
      createTokenResponse(
        {
          _id: doctorId,
          name: demoDoctor.name,
          email: demoDoctor.email,
          role: 'doctor'
        },
        { doctorId }
      )
    );
  }

  try {
    await withTimeout(connectDB(process.env.MONGO_URI), 5000, 'Mongo connect');
    const user = await withTimeout(
      User.findOne({ email: normalizedEmail }),
      5000,
      'User lookup'
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await withTimeout(bcrypt.compare(password, user.password), 5000, 'Password compare');
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = createTokenResponse(user);

    if (user.role === 'doctor') {
      const doctorProfile = await withTimeout(
        Doctor.findOne({ userId: user._id }),
        5000,
        'Doctor lookup'
      );
      payload.doctorId = doctorProfile?._id || null;
      payload.token = signToken({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctorId: payload.doctorId
      });
    }

    return res.json(payload);
  } catch (error) {
    return res.status(503).json({ message: error.message || 'Login temporarily unavailable' });
  }
};

export const me = async (req, res) => {
  const payload = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    doctorId: req.user.doctorId || null
  };

  res.json(payload);
};
