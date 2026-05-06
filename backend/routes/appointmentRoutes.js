import express from 'express';
import { cancelAppointment, createAppointment, getMyAppointments, updateAppointment } from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createAppointment);
router.get('/me', protect, getMyAppointments);
router.patch('/:id', protect, updateAppointment);
router.delete('/:id', protect, cancelAppointment);

export default router;
