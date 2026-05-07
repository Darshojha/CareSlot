import express from 'express';
import { cancelAppointment, createAppointment, getMyAppointments, updateAppointment } from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/database.js';

const router = express.Router();

router.post('/', protect, requireDatabase, createAppointment);
router.get('/me', protect, requireDatabase, getMyAppointments);
router.patch('/:id', protect, requireDatabase, updateAppointment);
router.delete('/:id', protect, requireDatabase, cancelAppointment);

export default router;
