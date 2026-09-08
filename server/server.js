import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import Appointment from './models/Appointment.js'
import Admin from './models/Admin.js'
import { sendAppointmentNotification } from './services/emailService.js'

const app = express()
app.set('trust proxy', 1)
const port = process.env.PORT || 5000
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(cors({ origin: clientUrl }))
app.use(express.json({ limit: '100kb' }))
const appointmentLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false })

const fallbackContent = {
  doctor: { name: 'ডাঃ মোঃ আলমগীর জলিল প্রামানিক', designation: 'সহকারী অধ্যাপক, সার্জারি বিভাগ', institution: 'রংপুর মেডিকেল কলেজ হাসপাতাল, রংপুর', specialization: 'ল্যাপারোস্কোপিক সার্জন / ল্যাপারোস্কোপিক সার্জারি বিশেষজ্ঞ', introduction: 'ডাঃ মোঃ আলমগীর জলিল প্রামানিক একজন ল্যাপারোস্কোপিক সার্জন এবং সার্জারি বিভাগের সহকারী অধ্যাপক। তিনি আধুনিক ল্যাপারোস্কোপিক পদ্ধতিতে বিভিন্ন ধরনের সার্জিক্যাল রোগের চিকিৎসা ও অপারেশন সেবা প্রদান করেন।', image: '/assets/doctor.jpg' },
  contacts: { serial: '01788-044279', emergency: '0155-9617223', whatsapp: '8801788044279' },
  chamber: { name: 'মাউন্ট প্যাসিফিক হাসপাতাল', address: 'রংপুর, বাংলাদেশ', visitingDays: 'ভিজিটিং ডে শীঘ্রই আপডেট করা হবে', visitingHours: 'বিকাল ৩টা থেকে রাত ৮টা পর্যন্ত', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Mount+Pacific+Hospital+Rangpur+Bangladesh' },
  services: [
    { title: 'ল্যাপারোস্কোপিক গলব্লাডার (পিত্তথলি) অপারেশন', description: 'পিত্তথলি সংক্রান্ত সমস্যার জন্য আধুনিক ল্যাপারোস্কোপিক সার্জারি সেবা।', icon: '◈' },
    { title: 'ল্যাপারোস্কোপিক অ্যাপেন্ডিসাইটিস অপারেশন', description: 'অ্যাপেন্ডিসাইটিসের প্রয়োজনীয় সার্জিক্যাল মূল্যায়ন ও অপারেশন সেবা।', icon: '✦' },
    { title: 'ল্যাপারোস্কোপিক হার্নিয়া অপারেশন', description: 'হার্নিয়া সমস্যার জন্য রোগীর প্রয়োজন অনুযায়ী সার্জিক্যাল পরামর্শ।', icon: '⌁' },
    { title: 'ল্যাপারোস্কোপিক কোলন ও রেক্টাল সার্জারি', description: 'কোলন ও রেক্টাল সমস্যায় প্রাসঙ্গিক সার্জিক্যাল চিকিৎসা সেবা।', icon: '◌' },
    { title: 'অ্যাসিডিটি / আলসার / অন্যান্য গ্যাস্ট্রিক সমস্যার সার্জারি', description: 'গ্যাস্ট্রিক সমস্যায় প্রয়োজন হলে সার্জিক্যাল পরামর্শ ও চিকিৎসা পরিকল্পনা।', icon: '⊙' }
  ]
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.get('/api/content', (_req, res) => res.json(fallbackContent))
app.post('/api/appointments', appointmentLimiter, async (req, res) => {
  const { patientName, phone, preferredDate, preferredTime, email, message } = req.body
  if (!patientName || !phone || !preferredDate || !preferredTime) return res.status(400).json({ message: 'Required fields are missing' })
  const appointmentDate = new Date(`${preferredDate}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || Number.isNaN(appointmentDate.getTime()) || appointmentDate < today) return res.status(400).json({ message: 'Please select today or a future date' })
  if (!/^\d{2}:\d{2}$/.test(preferredTime) || preferredTime < '15:00' || preferredTime > '20:00') return res.status(400).json({ message: 'Appointments are available from 3:00 PM to 8:00 PM' })
  if (!mongoose.connection.readyState) return res.status(503).json({ message: 'Appointment service is not configured yet' })
  try {
    const appointment = await Appointment.create({ patientName, phone, preferredDate, preferredTime, email, message })
    const notification = await sendAppointmentNotification(appointment)
    res.status(201).json({ success: true, message: notification.sent ? 'Appointment request received' : 'Appointment request received. Email notification could not be sent.', id: appointment.id })
  } catch (error) { res.status(500).json({ success: false, message: 'Could not save appointment' }) }
})
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  try { const admin = await Admin.findOne({ email }); if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) return res.status(401).json({ message: 'Invalid credentials' }); const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '8h' }); res.json({ token }) } catch { res.status(500).json({ message: 'Login unavailable' }) }
})

if (process.env.MONGODB_URI) mongoose.connect(process.env.MONGODB_URI).then(async () => { console.log('MongoDB connected'); if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && !(await Admin.exists({ email: process.env.ADMIN_EMAIL }))) await Admin.create({ email: process.env.ADMIN_EMAIL, passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12) }) }).catch(error => console.error('MongoDB connection failed:', error.message))
else console.warn('MONGODB_URI is not configured; appointment persistence is disabled.')

if (!process.env.VERCEL) app.listen(port, () => console.log(`API listening on http://localhost:${port}`))

export default app
