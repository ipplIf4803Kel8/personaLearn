import nodemailer from 'nodemailer'
import 'dotenv/config'

// Tanpa SMTP_HOST, kode dicetak ke console supaya alur lupa kata sandi tetap bisa dicoba.
export async function sendOtpEmail(to, otp) {
  const text = `Kode untuk mengatur ulang kata sandi personaLearn: ${otp}. Berlaku 10 menit. Abaikan email ini jika bukan Anda yang meminta.`
  if (!process.env.SMTP_HOST) {
    console.log(`[OTP] ${to}: ${otp}`)
    return
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@personalearn.id',
    to,
    subject: 'Kode atur ulang kata sandi personaLearn',
    text,
  })
}
