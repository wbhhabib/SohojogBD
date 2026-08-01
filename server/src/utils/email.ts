import nodemailer from 'nodemailer'
import { env } from '../config/env'

const isSmtpConfigured = (): boolean => {
  return !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS)
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  })
}

export const sendVerificationEmail = async (
  to: string,
  name: string,
  token: string
): Promise<void> => {
  if (!isSmtpConfigured()) {
    console.warn('⚠️  SMTP not configured — skipping verification email')
    return
  }
  try {
    const transporter = createTransporter()
    const link = `${env.CLIENT_URL}/auth/verify-email?token=${token}`

    await transporter.sendMail({
      from: env.FROM_EMAIL,
      to,
      subject: 'Verify your email — FundRaise',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to FundRaise, ${name}!</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${link}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          ">Verify Email</a>
          <p style="margin-top: 16px; color: #6b7280;">
            Or copy this link: <a href="${link}">${link}</a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            This link expires in 24 hours. If you did not create an account, ignore this email.
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send verification email:', error)
  }
}

export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  token: string
): Promise<void> => {
  if (!isSmtpConfigured()) {
    console.warn('⚠️  SMTP not configured — skipping password reset email')
    return
  }
  try {
    const transporter = createTransporter()
    const link = `${env.CLIENT_URL}/auth/reset-password?token=${token}`

    await transporter.sendMail({
      from: env.FROM_EMAIL,
      to,
      subject: 'Reset your password — FundRaise',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${name}, we received a request to reset your password.</p>
          <a href="${link}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #dc2626;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          ">Reset Password</a>
          <p style="margin-top: 16px; color: #6b7280;">
            Or copy this link: <a href="${link}">${link}</a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            This link expires in 1 hour. If you did not request a password reset, ignore this email.
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send password reset email:', error)
  }
}

export const sendDonationConfirmation = async (
  to: string,
  donorName: string,
  campaignTitle: string,
  amount: number
): Promise<void> => {
  if (!isSmtpConfigured()) return
  try {
    const transporter = createTransporter()
    const formattedAmount = `৳${amount.toLocaleString('bn-BD')}`

    await transporter.sendMail({
      from: env.FROM_EMAIL,
      to,
      subject: `Donation Confirmed — ${campaignTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for your donation, ${donorName}!</h2>
          <p>Your donation has been successfully processed.</p>
          <div style="
            background-color: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
          ">
            <p style="margin: 4px 0;"><strong>Campaign:</strong> ${campaignTitle}</p>
            <p style="margin: 4px 0;"><strong>Amount:</strong> ${formattedAmount}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> Completed</p>
          </div>
          <p>Your generosity makes a real difference. Thank you for supporting this cause!</p>
          <p style="color: #6b7280; font-size: 14px;">— The FundRaise Team</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send donation confirmation email:', error)
  }
}

export const sendDonationNotification = async (
  to: string,
  creatorName: string,
  campaignTitle: string,
  amount: number
): Promise<void> => {
  if (!isSmtpConfigured()) return
  try {
    const transporter = createTransporter()
    const formattedAmount = `৳${amount.toLocaleString('bn-BD')}`

    await transporter.sendMail({
      from: env.FROM_EMAIL,
      to,
      subject: `New donation received — ${campaignTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Great news, ${creatorName}!</h2>
          <p>Your campaign just received a new donation.</p>
          <div style="
            background-color: #eff6ff;
            border: 1px solid #93c5fd;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
          ">
            <p style="margin: 4px 0;"><strong>Campaign:</strong> ${campaignTitle}</p>
            <p style="margin: 4px 0;"><strong>Amount Received:</strong> ${formattedAmount}</p>
          </div>
          <p>Keep up the great work and keep your supporters updated with campaign progress!</p>
          <p style="color: #6b7280; font-size: 14px;">— The FundRaise Team</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send donation notification email:', error)
  }
}