import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema({
  username: { type: String, trim: true, lowercase: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin'], default: 'admin' }
}, { timestamps: true })

export default mongoose.model('Admin', adminSchema)
