import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    if (!config.smtp.user || !config.smtp.pass) {
      console.log(`[Email Skipped] To: ${to}, Subject: ${subject}`);
      return true; // Gracefully skip if SMTP not configured
    }

    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

export const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
  const verifyUrl = `${config.client.url}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">AssetFlow - Email Verification</h2>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
      <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
    </div>
  `;
  return sendEmail(email, 'Verify Your Email - AssetFlow', html);
};

export const sendResetPasswordEmail = async (email: string, token: string): Promise<boolean> => {
  const resetUrl = `${config.client.url}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">AssetFlow - Password Reset</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
      <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  `;
  return sendEmail(email, 'Reset Your Password - AssetFlow', html);
};
