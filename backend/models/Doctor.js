import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    slots: [{ type: String, trim: true }]
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 },
    fee: { type: Number, required: true, min: 0 },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    about: { type: String, required: true, trim: true },
    availability: { type: [slotSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model('Doctor', doctorSchema);
