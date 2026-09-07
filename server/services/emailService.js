import nodemailer from 'nodemailer'

let transporter

function smtpConfigured() {
  return ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'].every((key) => Boolean(process.env[key]))
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER.trim(), pass: process.env.SMTP_PASS.replace(/\s+/g, '') }
    })
  }
  return transporter
}

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character])

export async function sendAppointmentNotification(appointment) {
  if (!smtpConfigured()) {
    console.warn('Appointment email notification skipped: SMTP is not configured')
    return { sent: false }
  }

  const recipient = process.env.NOTIFICATION_EMAIL || 'sourovrgc@gmail.com'
  const submittedAt = new Date(appointment.createdAt || Date.now()).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' })
  const fields = [
    ['Patient Name', appointment.patientName],
    ['Mobile Number', appointment.phone],
    ['Preferred Date', appointment.preferredDate],
    ['Preferred Time', appointment.preferredTime],
    ['Problem / Message', appointment.message || 'Not provided'],
    ['Appointment Status', appointment.status || 'pending'],
    ['Submitted At', submittedAt]
  ]
  const text = `New Appointment Request\n\n${fields.map(([label, value]) => `${label}: ${value}`).join('\n')}\n\nDoctor Website\nDr. Md. Alamgir Jalil Pramanik\nAssistant Professor, Department of Surgery\nRangpur Medical College Hospital, Rangpur\nLaparoscopic Surgeon`
  const rows = fields.map(([label, value]) => `<tr><td style="padding:9px 12px;color:#52636f;font-weight:700;border-bottom:1px solid #e5eaed">${escapeHtml(label)}</td><td style="padding:9px 12px;color:#172b3a;border-bottom:1px solid #e5eaed">${escapeHtml(value)}</td></tr>`).join('')
  const html = `<!doctype html><html><body style="margin:0;background:#f4f7f8;font-family:Arial,sans-serif;color:#172b3a"><main style="max-width:620px;margin:24px auto;background:#ffffff;border:1px solid #dce5e8;border-radius:8px;overflow:hidden"><header style="padding:24px 28px;background:#0b2e4a;color:#ffffff"><h1 style="margin:0;font-size:20px">New Appointment Request</h1><p style="margin:7px 0 0;color:#b9dedb;font-size:13px">Dr. Alamgir Website</p></header><section style="padding:22px 28px"><table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table></section><footer style="padding:18px 28px;background:#f5f9f9;color:#52636f;font-size:12px;line-height:1.6">Dr. Md. Alamgir Jalil Pramanik<br>Assistant Professor, Department of Surgery<br>Rangpur Medical College Hospital, Rangpur<br>Laparoscopic Surgeon</footer></main></body></html>`

  try {
    await getTransporter().sendMail({ from: process.env.SMTP_USER.trim(), to: recipient, subject: 'New Appointment Request - Dr. Alamgir Website', text, html })
    return { sent: true }
  } catch (error) {
    console.error('Appointment email notification failed:', error.message)
    return { sent: false }
  }
}
