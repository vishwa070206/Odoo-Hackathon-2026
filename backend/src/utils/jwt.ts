import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../types';

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
};

export const generateEmailToken = (): string => {
  return jwt.sign({ purpose: 'email-verify' }, config.jwt.secret, {
    expiresIn: '24h',
  } as jwt.SignOptions);
};

export const generateResetToken = (): string => {
  return jwt.sign({ purpose: 'password-reset' }, config.jwt.secret, {
    expiresIn: '1h',
  } as jwt.SignOptions);
};
