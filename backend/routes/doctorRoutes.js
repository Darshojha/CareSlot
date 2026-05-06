import express from 'express';
import { getDoctorById, getDoctorSlots, getDoctors, updateDoctorSlots } from '../controllers/doctorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getDoctorSlots);
router.patch('/:id/slots', protect, updateDoctorSlots);

export default router;
