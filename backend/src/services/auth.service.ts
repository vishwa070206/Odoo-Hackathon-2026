import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateAccessToken, generateRefreshToken, generateEmailToken, generateResetToken, verifyRefreshToken } from '../utils/jwt';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/email';
import { generateEmployeeId } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import { SignupDTO, LoginDTO } from '../dto';
import { RoleEnum } from '../types';

export class AuthService {
  async signup(data: SignupDTO) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new AppError('Email already registered', 400);

    // Get Employee role
    let employeeRole = await prisma.role.findUnique({ where: { name: RoleEnum.EMPLOYEE } });
    if (!employeeRole) {
      employeeRole = await prisma.role.create({
        data: { name: RoleEnum.EMPLOYEE, label: 'Employee' }
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    // Generate employee ID
    const lastUser = await prisma.user.findFirst({
      where: { employeeId: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    const employeeId = generateEmployeeId(lastUser?.employeeId || undefined);

    const emailToken = generateEmailToken();

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        employeeId,
        roleId: employeeRole.id,
        emailVerifyToken: emailToken,
      },
      include: { role: true },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(data.email, emailToken).catch(console.error);

    const tokenPayload = { userId: user.id, email: user.email, role: user.role.name };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId,
        role: user.role.name,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { role: true, department: true },
    });

    if (!user || user.isDeleted) throw new AppError('Invalid credentials', 401);
    if (user.status !== 'ACTIVE') throw new AppError('Account is deactivated', 403);

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) throw new AppError('Invalid credentials', 401);

    const tokenPayload = { userId: user.id, email: user.email, role: user.role.name };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        employeeId: user.employeeId,
        role: user.role.name,
        roleLabel: user.role.label,
        department: user.department ? { id: user.department.id, name: user.department.name } : null,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: true },
      });

      if (!user || user.refreshToken !== token || user.isDeleted) {
        throw new AppError('Invalid refresh token', 401);
      }

      const tokenPayload = { userId: user.id, email: user.email, role: user.role.name };
      const accessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If an account exists, a reset email has been sent' };

    const resetToken = generateResetToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    await sendResetPasswordEmail(email, resetToken);
    return { message: 'If an account exists, a reset email has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { gt: new Date() },
      },
    });

    if (!user) throw new AppError('Invalid or expired reset token', 400);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
        refreshToken: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user) throw new AppError('Invalid verification token', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerifyToken: null },
    });

    return { message: 'Email verified successfully' };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, department: true },
    });

    if (!user) throw new AppError('User not found', 404);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      employeeId: user.employeeId,
      role: user.role.name,
      roleLabel: user.role.label,
      department: user.department ? { id: user.department.id, name: user.department.name } : null,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }
}
