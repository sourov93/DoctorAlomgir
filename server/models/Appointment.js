import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  email: { type: String, trim: true, lowercase: true, maxlength: 120 },
  preferredDate: { type: String, required: true },
  preferredTime: { type: String, required: true },
  message: { type: String, trim: true, maxlength: 1000 },
  status: { type: String, enum: ['pending', 'contacted', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true })

export default mongoose.model('Appointment', appointmentSchema)
