import express from 'express';
import { getDoctorById, getDoctorSlots, getDoctors, updateDoctorSlots } from '../controllers/doctorController.js';
import { protect } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/database.js';

const router = express.Router();

const setDoctorIdFromQuery = (req, res, next) => {
  if (!req.query.id) {
    return res.status(400).json({ message: 'Doctor id is required' });
  }

  req.params.id = req.query.id;
  next();
};

router.get('/', getDoctors);
router.get('/slots', setDoctorIdFromQuery, getDoctorSlots);
router.patch('/slots', protect, requireDatabase, setDoctorIdFromQuery, updateDoctorSlots);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getDoctorSlots);
router.patch('/:id/slots', protect, requireDatabase, updateDoctorSlots);

export default router;
