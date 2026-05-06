import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentDate: { type: Date, required: true },
    slotTime: { type: String, required: true, trim: true },
    confirmationEmail: { type: String, default: '', lowercase: true, trim: true },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    reason: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, appointmentDate: 1, slotTime: 1 }, { unique: true, partialFilterExpression: { status: 'scheduled' } });

export default mongoose.model('Appointment', appointmentSchema);
